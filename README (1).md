# Despensa — Lite & Pro

App de gestão de stock da despensa doméstica, com **duas edições que
partilham exatamente o mesmo código** (`api/` e `app/`) — só muda a
infraestrutura à volta.

Nenhuma variável, domínio ou segredo fica gravado neste repositório —
tudo é fornecido em runtime (via Portainer ou ficheiro `.env` local).

## Comparação

| | **Lite** (RPi4) | **Pro** (OCI) |
|---|---|---|
| Ficheiro de compose | `docker-compose.lite.yml` | `docker-compose.pro.yml` |
| Base de dados | SQLite (ficheiro local) | PostgreSQL |
| Cache | nenhuma | Redis — cache das consultas ao Open Food Facts |
| Tarefas em segundo plano | nenhuma (tudo calculado ao pedido) | container `despensa-worker` — cron diário (08:00) que verifica stock baixo e produtos a expirar |
| Notificações | só dentro da app, quando aberta | Web Push (opcional) — chegam mesmo com a app fechada |
| Serviços no stack | 2 (api + app) | 5 (api + app + worker + postgres + redis) |

## Estrutura do repositório

```
api/                      — Node.js + Express + Knex (fala com SQLite ou Postgres)
app/                       — PWA React + Vite, servida por Nginx
docker-compose.lite.yml    — edição Lite
docker-compose.pro.yml     — edição Pro
.env.rpi.example           — variáveis de referência da Lite
.env.oci.example           — variáveis de referência da Pro
```

## Deploy — Lite (Raspberry Pi 4)

Via Portainer (recomendado): **Stacks → Add stack → Repository**, aponta
para este repositório e para `docker-compose.lite.yml`. Em
**Environment variables**, define:

| Variável | Valor sugerido |
|---|---|
| `DEPLOY_EDITION` | `lite` |
| `DB_DRIVER` | `sqlite` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `NPM_NETWORK_NAME` | nome real da rede do teu proxy (`docker network ls`) |

Manual, sem Portainer:
```
cp .env.rpi.example .env
docker compose -f docker-compose.lite.yml --env-file .env up -d --build
```

## Deploy — Pro (OCI Ampere)

Igual, mas apontando a **Repository** para `docker-compose.pro.yml`. Variáveis:

| Variável | Valor sugerido |
|---|---|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | à tua escolha |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `NPM_NETWORK_NAME` | nome real da rede do teu proxy |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | opcional — gera com `npx web-push generate-vapid-keys` |

Manual:
```
cp .env.oci.example .env
docker compose -f docker-compose.pro.yml --env-file .env up -d --build
```

Depois de qualquer um dos deploys, segue os passos normais: cria o
Proxy Host / regra de *ingress* para o subdomínio → destino
`despensa-app:80` com HTTPS, abre o domínio (cai no wizard `/setup`
com o domínio já detetado) e instala a PWA em cada telemóvel
("Adicionar ao ecrã principal").

## Funcionalidades incluídas

- Wizard de primeira instalação (admin + membros + domínio)
- Login com sessão (JWT)
- Registo de stock com validade e localização
- Leitura de código de barras pela câmara (ZXing) com consulta
  automática à **Open Food Facts** (grátis, sem chave) — com cache em
  Redis na edição Pro
- Alertas de produtos a expirar e lista de compras automática quando
  o stock desce abaixo do mínimo definido por produto
- Histórico de movimentos (entradas/consumos)
- **Só na Pro**: worker diário (stock baixo + validades) e
  notificações push opcionais — botão "🔔 Notificações" no ecrã
  principal

## Ainda por fazer (fica fácil de adicionar depois)

- Upload de fotografia livre para produtos sem código de barras
- Ícones da PWA (`icon-192.png`, `icon-512.png`) em `app/public/`
- Multi-tenant na edição Pro (várias casas na mesma instalação) — o
  caminho é acrescentar uma tabela `households` e uma coluna
  `household_id` às tabelas principais, filtrando todas as queries por
  ela; não implementado ainda porque não é preciso para uma só casa
