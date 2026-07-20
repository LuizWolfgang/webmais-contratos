#!/bin/sh
set -e

npx prisma migrate deploy

# PROCESS_TYPE escolhe qual processo rodar na mesma imagem (api ou worker),
# já que algumas plataformas de deploy não permitem sobrescrever o CMD do Dockerfile por serviço.
if [ "$PROCESS_TYPE" = "worker" ]; then
  exec node dist/worker.main.js
fi

exec "$@"
