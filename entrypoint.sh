#!/bin/sh
set -e

echo "🗄️  Sincronizando schema do banco de dados..."
npx prisma db push --accept-data-loss 2>&1

echo "🌱 Verificando necessidade de seed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.team.count().then(count => {
  if (count === 0) {
    console.log('Banco vazio - executando seed inicial...');
    const { execSync } = require('child_process');
    try {
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
      console.log('Seed concluído!');
    } catch(e) {
      console.error('Erro no seed:', e.message);
    }
  } else {
    console.log('Dados já existem (' + count + ' times) - pulando seed.');
  }
  return p.\$disconnect();
}).catch(e => { console.error(e.message); return p.\$disconnect(); });
"

echo "🚀 Iniciando Copa Bertuzzo 2026..."
exec "$@"
