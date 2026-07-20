# WebMais Contratos

Módulo de Gestão de Contratos — desafio técnico para processo seletivo da WebMais. Cadastro de contratos vinculados a clientes, com controle de status (Ativo / Vencido / Encerrado) atualizado automaticamente por um pipeline assíncrono baseado em Kafka.

## Deploy (bônus)

Aplicação completa hospedada no [Railway](https://railway.com/) (Postgres, Redis, Kafka, API, worker e frontend, cada um como serviço independente):

- **Frontend**: https://web-production-9b989.up.railway.app (login `admin` / `admin123`)
- **API**: https://api-production-876a.up.railway.app

## Stack

- **Backend**: Node.js + TypeScript, [NestJS](https://nestjs.com/), REST API
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Banco de dados**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Cache**: Redis (cache-aside explícito na listagem e no resumo de contratos)
- **Processamento assíncrono**: **Apache Kafka**, no lugar de BullMQ (ver [Decisões de arquitetura](#decisões-de-arquitetura))
- **Autenticação**: JWT, usuário fixo seedado (`admin` / `admin123`)
- **Testes**: Jest (backend) e Vitest (frontend)
- **CI**: GitHub Actions (lint + test em backend e frontend)

## Como rodar o projeto

### 1. Subir a infraestrutura (Postgres, Redis, Kafka)

```bash
docker compose up -d
```

Isso sobe Postgres (`5432`), Redis (`6379`) e um broker Kafka em modo KRaft (`29092`), sem precisar de Zookeeper. Opcionalmente, `docker compose --profile tools up -d kafka-ui` sobe um painel web em `http://localhost:8080` para inspecionar tópicos.

> Se as portas 5432/6379 já estiverem em uso na sua máquina, rode com `POSTGRES_PORT=55432 REDIS_PORT=56379 docker compose up -d` e ajuste o `.env` do backend de acordo.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev        # API em http://localhost:3001
```

Em **outro terminal**, suba o worker (scheduler + consumer Kafka):

```bash
cd backend
npm run start:worker
```

O worker garante o tópico `contracts.expired`, varre contratos ativos vencidos a cada 15s (configurável) e consome os eventos para atualizar o status no banco.

Requer Node **20.19+ / 22.12+ / 24+** (Prisma 6 não roda em versões ímpares do Node, ex. 21/23). O repositório inclui um `.nvmrc` no backend.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

### 4. Login

Usuário: `admin` — Senha: `admin123` (criado pelo seed do Prisma).

### Rodando tudo containerizado (bônus)

```bash
docker compose --profile full up -d --build
```

Sobe também `api`, `worker` e `web` (Nginx) a partir dos `Dockerfile`s de cada app. Frontend em `http://localhost:8081`.

### Testes

```bash
cd backend && npm test
cd frontend && npm test
```

## Arquitetura

O backend segue **Clean Architecture / DDD leve** dentro da estrutura de módulos do Nest. Cada módulo de domínio (`clients`, `contracts`, `auth`) é dividido em camadas:

```
<módulo>/
├── domain/          # entidades e portas (interfaces de repositório) — TypeScript puro, sem Nest/Prisma
├── application/     # use-cases — orquestram regras de negócio via as portas do domain
├── infrastructure/  # implementações concretas das portas (repositório Prisma, adapters)
└── interfaces/      # controllers, DTOs/validação — único lugar ciente de HTTP
```

`domain` não depende de nada externo; `application` depende só de `domain`; `infrastructure` implementa as portas declaradas em `domain`; `interfaces` é a borda HTTP. O container de DI do NestJS faz o papel de composition root, injetando as implementações concretas nos use-cases via tokens (`@Inject(CONTRACT_REPOSITORY)` etc.).

Módulos de infraestrutura compartilhada: `prisma/` (client), `redis/` (cache-aside), `kafka/` (client, criação idempotente de tópico, publisher de eventos) e `worker/` (processo separado que roda o scheduler de expiração e o consumer Kafka). A API (`main.ts`) e o worker (`worker.main.ts`) são **dois entrypoints independentes** sobre o mesmo código: a API expõe o REST e não conhece Kafka; o worker roda o pipeline assíncrono e não expõe HTTP.

### Regra de negócio de status

Um contrato sempre nasce **Ativo**, mesmo com data de vencimento no passado — isso permite testar o job de expiração imediatamente. Editar o vencimento de um contrato **Vencido** para uma data futura o retorna para **Ativo** (regra encapsulada na entidade `Contract`, não no controller). Excluir um cliente com contratos vinculados é bloqueado (409), via constraint de FK no Postgres traduzida em erro de domínio no repositório.

## Decisões de arquitetura

### Kafka no lugar de BullMQ

O enunciado aceita explicitamente substituir BullMQ por Kafka como diferencial ("Uso de RabbitMQ/Kafka no lugar do BullMQ"), cobrindo ao mesmo tempo o requisito mínimo de job assíncrono. O fluxo:

1. **`ExpirationSchedulerProvider`** (`backend/src/worker/expiration-scheduler.provider.ts`) — roda em um `setInterval` (padrão 15s) dentro do processo `worker`, chamando o use-case de varredura.
2. **`ScanOverdueContractsUseCase`** — busca contratos `ATIVO` com `dueDate < now()` (índice dedicado `@@index([status, dueDate])` no schema) e publica um evento por contrato no tópico `contracts.expired`.
3. **`KafkaEventPublisherAdapter`** — implementa a porta genérica `EventPublisher` usando o client Kafka.
4. **`ContractExpiredConsumer`** — consome o tópico e delega ao use-case de marcação.
5. **`MarkContractExpiredUseCase`** — faz um **update condicional** (`UPDATE ... WHERE status = 'ATIVO'`) e só marca `VENCIDO` se ainda estiver `ATIVO`. Isso torna o processamento **idempotente**: reprocessar a mesma mensagem (reinício do consumer, rebalance, ou o scheduler publicando de novo antes do consumo anterior) é um no-op seguro, sem depender de deduplicação externa.

Client usado: [`@confluentinc/kafka-javascript`](https://github.com/confluentinc/confluent-kafka-javascript) (mantido ativamente pela Confluent, wrapper sobre `librdkafka` com API compatível com `kafkajs`) — `kafkajs` está sem manutenção desde 2023.

Optou-se por um único mecanismo (scheduler periódico), em vez de também disparar a checagem na consulta da listagem: o enunciado aceita qualquer uma das duas abordagens, e um único caminho é mais simples de testar e não acopla o `GET /contracts` a efeitos colaterais de escrita.

**Por que esse desenho é confiável (e por que não precisa de outbox):** o scheduler consulta a fonte da verdade (Postgres) a cada ciclo. Se o Kafka estiver fora, uma mensagem se perder, ou o consumer cair no meio do processamento, o próximo ciclo simplesmente **re-detecta e re-publica** os contratos que continuam `ATIVO` e vencidos. Combinado com o consumer idempotente, isso entrega semântica *at-least-once* fim a fim **sem** precisar do padrão transactional outbox — a reconciliação é intrínseca ao polling da fonte da verdade. É uma troca consciente: assume-se uma latência de até um intervalo do scheduler em favor de simplicidade e resiliência.

**Separação de processos:** a API REST (`main.ts`) depende apenas de Postgres e Redis — **não** importa o módulo de Kafka e sobe normalmente mesmo com o broker indisponível. Todo o contato com o Kafka (producer no scan, consumer no update, criação do tópico) vive exclusivamente no processo `worker` (`worker.main.ts`). Isso mantém o caminho de request HTTP desacoplado da mensageria e permite escalar/deployar API e worker de forma independente.

**Onde o Kafka agrega valor aqui:** além de cumprir o diferencial pedido, o tópico `contracts.expired` é um ponto de extensão natural — novos consumers (notificação por e-mail, trilha de auditoria, atualização de read models) podem reagir ao mesmo evento sem tocar no código de detecção. Para o volume deste desafio, um `UPDATE` direto no scheduler resolveria; o barramento de eventos é o que abre espaço para esse crescimento e é o que a troca por Kafka/RabbitMQ no enunciado busca exercitar.

### Cache Redis

Cache-aside **explícito** nos use-cases `ListContractsUseCase` e `GetContractsSummaryUseCase` (não foi usado um decorator/interceptor do Nest, para o padrão ficar visível no código). Chaves fixas `contracts:list` e `contracts:summary`, TTL de 60s como rede de segurança, invalidadas ativamente em toda escrita de contrato (criar/editar/excluir/encerrar) e no consumer Kafka.

### Banco de dados

```
User(id, username, passwordHash)
Client(id, name, document unique) 1 ---- N Contract(id, number unique, clientId, value, dueDate, status, ...)
```

`Contract.clientId` tem `onDelete: Restrict`. `@@index([status, dueDate])` sustenta a varredura de vencidos; `@@index([clientId])` sustenta o join na listagem.

### Cortes de escopo conscientes

- Sem dead-letter queue para mensagens do Kafka que falhem repetidamente — erro de payload é logado e descartado (evita loop infinito de poison pill); erro de infraestrutura é logado e relançado, deixando o processo reiniciar e retomar do offset não commitado.
- Sem paginação/filtros na listagem de contratos e clientes (não exigido pelo escopo).
- Testes automatizados cobrem os pontos mais sensíveis (regras da entidade `Contract` e idempotência do consumer), não a suíte inteira.

## Endpoints principais

Todas as rotas exigem `Authorization: Bearer <token>`, exceto o login.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autentica, retorna `{ token, user }` |
| GET/POST | `/clients` | Lista / cria cliente |
| GET/PUT/DELETE | `/clients/:id` | Detalhe / atualiza / exclui (409 se tiver contratos) |
| GET/POST | `/contracts` | Lista (cache-aside) / cria contrato |
| GET/PUT/DELETE | `/contracts/:id` | Detalhe / atualiza / exclui |
| PATCH | `/contracts/:id/close` | Encerra manualmente (409 se já encerrado) |
| GET | `/contracts/summary` | Contagem por status (cache-aside) |

## Uso de ferramentas de IA

Este projeto foi desenvolvido com **Claude Code** como par de desenvolvimento durante praticamente todo o processo: planejamento da arquitetura (camadas DDD, modelagem do banco, desenho do fluxo Kafka), escrita do código de backend e frontend, e depuração de problemas reais de ambiente encontrados no caminho — por exemplo, incompatibilidade do Prisma 7 recém-lançado (revertido para a linha 6.x), correção do `rootDir` do `tsc` que gerava `dist/src/...` em vez de `dist/...`, e um caso específico de `npm ci` falhando em Linux por divergência de resolução do `ajv` entre versões do npm (resolvido regenerando o lockfile em container Linux).

Todas as decisões de arquitetura, a modelagem do banco, as regras de negócio e as trocas de escopo foram revisadas e validadas manualmente, incluindo testes ponta a ponta reais (subindo a stack completa via Docker, testando login, CRUD, encerramento manual e o ciclo completo do job de expiração via Kafka, tanto localmente quanto containerizado).
