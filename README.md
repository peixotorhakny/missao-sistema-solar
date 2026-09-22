# Missão Sistema Solar

Jogo educativo de Astronomia em 3D — explore o Sistema Solar pilotando uma nave,
cumpra missões e desafios sobre cada planeta, e compita num ranking global.

## Estrutura

- `index.html` — o jogo completo (3D com Three.js, quiz, missões).
- `api/ranking.js` — função serverless (Vercel) que lê/grava o ranking no Postgres (Neon).

## Configuração

1. Crie um banco no [Neon](https://neon.tech).
2. Na Vercel, defina a variável de ambiente `DATABASE_URL` com a connection string do Neon.
3. Deploy — a tabela `ranking` é criada automaticamente na primeira chamada da API.
