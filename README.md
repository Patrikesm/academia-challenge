# Desafio Academia

MVP full-stack para um grupo pequeno de academia.

## Stack

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Supabase Storage

## Regras

- Academia: 10 pontos
- Corrida 5km: 8 pontos
- Bicicleta 10km: 8 pontos
- Caminhada 3km: 6 pontos
- Foto obrigatória
- É possível registrar mais de uma atividade por dia, respeitando o limite de 18 pontos

## Rodar localmente

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

Crie um bucket chamado:

`activity-photos`

Para o MVP, deixe o bucket público para que as fotos possam ser exibidas pelo ranking/admin.

Depois configure as variáveis do `.env`.

## Importante antes de publicar

A rota `/admin` ainda é uma área de MVP e precisa receber autenticação antes do deploy público.

Também vale adicionar:

- limite de tamanho/compressão de imagens;
- exclusão de atividade pelo admin;
- autenticação real por código/magic link;
- proteção contra uso de e-mail de outra pessoa;
- regras de acesso do Supabase Storage.

## Participantes

O cadastro pode ser feito em `/admin`. Depois, o participante entra usando o e-mail cadastrado.
