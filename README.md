# WebMais Contratos

Módulo de Gestão de Contratos desenvolvido como desafio técnico para o processo seletivo da WebMais. A aplicação permite cadastrar clientes e contratos, mantendo o status dos contratos atualizado automaticamente por um processo assíncrono utilizando Kafka.

## Deploy (bônus)

A aplicação está hospedada no Railway, com cada serviço executando de forma independente (Postgres, Redis, Kafka, API, Worker e Frontend).

**Frontend:** https://web-production-9b989.up.railway.app
Login: `admin` / `admin123`

**API:** https://api-production-876a.up.railway.app

---

## Stack

**Backend**

* Node.js
* TypeScript
* NestJS
* REST API

**Frontend**

* React
* Vite
* TypeScript
* Tailwind CSS

**Banco de dados**

* PostgreSQL (Prisma ORM)

**Cache**

* Redis utilizando cache-aside nas listagens e no resumo de contratos.

**Processamento assíncrono**

* Apache Kafka (utilizado no lugar do BullMQ).

**Autenticação**

* JWT com usuário seedado (`admin` / `admin123`).

**Testes**

* Jest (backend)
* Vitest (frontend)

**CI**

* GitHub Actions executando lint e testes do backend e frontend.

---

# Como rodar o projeto

## 1. Subir a infraestrutura

```bash
docker compose up -d
```

Serão iniciados:

* PostgreSQL (`5432`)
* Redis (`6379`)
* Kafka em modo KRaft (`29092`), sem necessidade de Zookeeper.

Opcionalmente, é possível subir o Kafka UI:

```bash
docker compose --profile tools up -d kafka-ui
```

Disponível em:

```
http://localhost:8080
```

Caso as portas 5432 ou 6379 já estejam em uso:

```bash
POSTGRES_PORT=55432 REDIS_PORT=56379 docker compose up -d
```

Depois basta ajustar o `.env` do backend.

---

## 2. Backend

```bash
cd backend

npm install

cp .env.example .env

npx prisma migrate dev

npx prisma db seed

npm run start:dev
```

API disponível em:

```
http://localhost:3001
```

Em outro terminal execute o Worker:

```bash
cd backend

npm run start:worker
```

O Worker garante a criação do tópico `contracts.expired`, executa periodicamente a verificação de contratos vencidos (15 segundos por padrão) e processa os eventos publicados para atualizar o status dos contratos.

> Requer Node 20.19+, 22.12+ ou 24+. O Prisma 6 não possui suporte para versões ímpares do Node (21 e 23). O projeto inclui um `.nvmrc` para facilitar a configuração.

---

## 3. Frontend

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend disponível em:

```
http://localhost:5173
```

---

## 4. Login

Usuário:

```
admin
```

Senha:

```
admin123
```

Criados automaticamente pelo seed do Prisma.

---

## Rodando tudo com Docker

```bash
docker compose --profile full up -d --build
```

Também serão iniciados:

* API
* Worker
* Frontend (Nginx)

Frontend:

```
http://localhost:8081
```

---

## Testes

Backend

```bash
cd backend
npm test
```

Frontend

```bash
cd frontend
npm test
```

---

# Arquitetura

O backend foi organizado seguindo os princípios de Clean Architecture e um DDD simplificado. Cada módulo (`clients`, `contracts` e `auth`) possui quatro camadas bem definidas:

```text
<módulo>/
├── domain
├── application
├── infrastructure
└── interfaces
```

Responsabilidade de cada camada:

* **domain:** entidades e contratos (interfaces), sem dependência de NestJS ou Prisma.
* **application:** casos de uso responsáveis pelas regras de negócio.
* **infrastructure:** implementações concretas, como Prisma, Redis e Kafka.
* **interfaces:** controllers, DTOs e validações HTTP.

As dependências seguem apenas uma direção: `application` depende de `domain`, enquanto `infrastructure` implementa as interfaces definidas em `domain`. A injeção de dependências é realizada pelo próprio NestJS.

A infraestrutura compartilhada possui módulos para Prisma, Redis, Kafka e Worker. A API e o Worker são processos independentes sobre a mesma base de código. A API expõe apenas os endpoints REST, enquanto o Worker é responsável pelo processamento assíncrono.

## Regra de negócio

Todo contrato nasce com status **ATIVO**, mesmo que sua data de vencimento já tenha passado. Isso permite validar facilmente o fluxo de expiração automática.

Caso um contrato vencido tenha sua data alterada para uma data futura, ele volta automaticamente para **ATIVO**.

Também não é permitido excluir clientes que ainda possuem contratos vinculados.

---

# Decisões de arquitetura

## Kafka no lugar do BullMQ

O desafio permitia substituir o BullMQ por Kafka como diferencial. A implementação ficou dividida em cinco etapas:

1. O `ExpirationSchedulerProvider` executa periodicamente uma varredura dos contratos.
2. O `ScanOverdueContractsUseCase` encontra contratos ativos vencidos e publica eventos no tópico `contracts.expired`.
3. O `KafkaEventPublisherAdapter` envia os eventos para o Kafka.
4. O `ContractExpiredConsumer` consome esses eventos.
5. O `MarkContractExpiredUseCase` atualiza o contrato para **VENCIDO** apenas se ele ainda estiver **ATIVO**, tornando o processamento idempotente.

Foi utilizado o client oficial da Confluent (`@confluentinc/kafka-javascript`), escolhido por possuir manutenção ativa.

O projeto utiliza apenas um scheduler periódico. Essa abordagem simplifica o código, facilita os testes e evita que consultas HTTP realizem alterações no banco.

Também não foi necessário utilizar o padrão Transactional Outbox. Como o scheduler consulta periodicamente o PostgreSQL, qualquer contrato que continue vencido e ativo será reenviado caso ocorra alguma falha no Kafka ou no Consumer. Como o processamento é idempotente, reprocessamentos não causam efeitos colaterais.

Outro ponto importante é a separação entre API e Worker. A API funciona normalmente mesmo que o Kafka esteja indisponível. Toda a comunicação com o broker acontece exclusivamente no Worker.

Além de atender ao requisito do desafio, o Kafka facilita futuras evoluções da aplicação. Novos consumidores podem ser adicionados para auditoria, notificações ou integração com outros sistemas sem alterar a lógica existente.

---

## Cache Redis

Foi utilizado o padrão Cache Aside nos casos de uso de listagem e resumo de contratos.

As chaves são invalidadas sempre que ocorre criação, atualização, exclusão, encerramento de contratos ou processamento pelo Consumer do Kafka.

O TTL utilizado é de 60 segundos.

---

## Banco de dados

```text
User(id, username, passwordHash)

Client(id, name, document unique)
        │
        └────── 1:N ────── Contract(id, number unique, clientId, value, dueDate, status)
```

O relacionamento utiliza `onDelete: Restrict`.

Também foram criados índices para otimizar a busca de contratos vencidos e as consultas por cliente.

---

## Cortes de escopo

* Não foi implementada Dead Letter Queue para mensagens do Kafka.
* Não foram implementados filtros ou paginação nas listagens.
* Os testes automatizados priorizam as regras de negócio mais críticas, como a entidade `Contract` e a idempotência do Consumer.

---

# Endpoints principais

Todas as rotas exigem autenticação JWT, com exceção do login.

| Método             | Endpoint               | Descrição                                 |
| ------------------ | ---------------------- | ----------------------------------------- |
| POST               | `/auth/login`          | Realiza autenticação e retorna o token    |
| GET / POST         | `/clients`             | Lista e cria clientes                     |
| GET / PUT / DELETE | `/clients/:id`         | Consulta, atualiza ou remove clientes     |
| GET / POST         | `/contracts`           | Lista e cria contratos                    |
| GET / PUT / DELETE | `/contracts/:id`       | Consulta, atualiza ou remove contratos    |
| PATCH              | `/contracts/:id/close` | Encerra um contrato manualmente           |
| GET                | `/contracts/summary`   | Retorna o resumo dos contratos por status |

---

# Uso de IA

Durante o desenvolvimento utilizei o Claude Code como ferramenta de apoio para acelerar a implementação, discutir alternativas de arquitetura, revisar código e auxiliar na resolução de problemas encontrados durante o projeto.

Toda a modelagem do banco, decisões arquiteturais, regras de negócio e definições de escopo foram revisadas manualmente. Também foram realizados testes ponta a ponta da aplicação, validando o funcionamento da API, autenticação, CRUDs, encerramento manual dos contratos e todo o fluxo de expiração automática utilizando Kafka, tanto localmente quanto em ambiente Docker.
