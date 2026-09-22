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
- Login com e-mail e senha, mantido por sessão persistente no dispositivo
- A tela `/minha-atividade` permite registrar atividades e excluir apenas registros do dia atual

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

O login dos participantes usa sessão em cookie `httpOnly` por 30 dias. As rotas de participante validam essa sessão no servidor.

Ainda vale adicionar:

- limite de tamanho/compressão de imagens;
- exclusão de atividade pelo admin;
- regras de acesso do Supabase Storage.

## Participantes

O cadastro pode ser feito em `/admin`, informando nome, e-mail e uma senha de pelo menos 6 caracteres. Depois, o participante entra usando essas credenciais.
