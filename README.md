# Projeto DevOps: GitHub Actions + AWS (Node/React, PostgreSQL e Mongo)

[![CI](https://github.com/andresalerno/ci-cd-atmos/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/andresalerno/ci-cd-atmos/actions/workflows/ci.yml)
[![CD](https://github.com/andresalerno/ci-cd-atmos/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/andresalerno/ci-cd-atmos/actions/workflows/cd.yml)
[![CI Meta](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/andresalerno/ci-cd-atmos/main/.badges/ci-meta.json)](https://github.com/andresalerno/ci-cd-atmos/actions/workflows/ci.yml)
[![CD Meta](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/andresalerno/ci-cd-atmos/main/.badges/cd-meta.json)](https://github.com/andresalerno/ci-cd-atmos/actions/workflows/cd.yml)

<!-- ci-meta-start -->
Última execução do CI: ainda não disponível
<!-- ci-meta-end -->

<!-- cd-meta-start -->
Última execução do CD: 2025-10-01 12:02:36 UTC • ator: andresalerno • branch: main • status: failure • tag: latest (run #29)
<!-- cd-meta-end -->

Para histórico de builds (data, hora e status), use a aba `Actions` do GitHub. Cada execução lista timestamp, commit, autor, duração e conclusão. Este repo também publica:
- Resumo por execução no “Workflow run summary” (rodapé do run)
- Artefato do build do frontend (`frontend/dist`) para download
- Artefato do backend (tar.gz com `src`, `package.json`, `Dockerfile`)
- Test reports e coverage (se gerados pelos scripts) como artifacts

## Testes e Cobertura (Vitest)

- Backend
  - Config: `backend/vitest.config.js` — reporter `default` e cobertura `v8` (`backend/coverage`).
  - Scripts: `npm run test` executa Vitest com cobertura; `npm run lint` roda ESLint.
  - Exemplo de teste: `backend/src/util.test.js`.
- Frontend
  - Config: `frontend/vite.config.js` inclui seção `test` do Vitest (reporter `default`) e `coverage`.
  - Scripts: `npm run test` executa Vitest com cobertura; `npm run lint` roda ESLint.
  - Exemplo de teste: `frontend/src/util.test.js`.

No CI, os jobs de teste publicam automaticamente:
- Cobertura: `backend/coverage/**`, `frontend/coverage/**`
  - Observação: Relatórios JUnit foram removidos para evitar dependência externa no reporter. Se desejar JUnit, posso reintroduzir usando um reporter disponível ou recurso nativo do Vitest (se suportado na versão).

### Badge dinâmico (Data/Hora/Ator)
- O job `update-readme-meta` atualiza o arquivo `.badges/ci-meta.json` com payload para o Shields.io.
- O README referencia: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/andresalerno/ci-cd-atmos/main/.badges/ci-meta.json`.
- Cache reduzido: `cacheSeconds: 60` no JSON para refletir em até ~1 minuto.
- Mostra status geral, timestamp UTC e ator da execução da última run em `main`.

Executando localmente:
- Backend: `cd backend && npm i && npm test`
- Frontend: `cd frontend && npm i && npm test`

Este repositório guia, passo a passo, a construção de um pipeline DevOps com GitHub Actions e AWS, usando:
- Backend: Node.js (Express)
- Frontend: React (Vite)
- Banco SQL: PostgreSQL (RDS na AWS)
- Banco NoSQL: MongoDB (Atlas ou DocumentDB – ver notas)
- Infraestrutura como código: Terraform

A ideia é primeiro configurar e documentar, depois provisionar e fazer deploy.

## Ordem recomendada (alto nível)

1) Repositório e automações básicas
- Estrutura do repo (backend, frontend, infra, workflows)
- CI para lint/test/build

2) Segurança e acesso à AWS
- Criar Role IAM com OIDC para GitHub Actions (sem chaves longas)
- Definir `secrets` e `variables` no GitHub

3) Infraestrutura em AWS (Terraform)
- VPC, subnets e segurança
- ECR (imagens Docker), ECS Fargate (backend)
- RDS PostgreSQL
- Frontend estático em S3 + CloudFront
- [Opcional] MongoDB: Atlas (recomendado para Mongo) ou DocumentDB (compatível, com diferenças)

4) Deploy contínuo
- Build e push de imagens (ECR)
- Apply do Terraform (plan + apply condicional)
- Atualização de serviços no ECS e upload do frontend para S3/CloudFront

## Estrutura do repositório

```
backend/
  src/
  package.json
  Dockerfile

frontend/
  src/
  package.json
  Dockerfile

infra/
  terraform/
    providers.tf
    variables.tf
    main.tf
    outputs.tf

.github/
  workflows/
    ci.yml
    cd.yml (placeholder)

docker-compose.yml (dev local com Postgres e Mongo)
```

## Decisões importantes

- OIDC para GitHub Actions: evita armazenar `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`. O workflow assume uma Role via OpenID Connect.
- MongoDB: Para ambiente AWS “puro”, use DocumentDB (compatível). Para MongoDB ‘real’, use MongoDB Atlas (freemium, mais simples). Este guia trará as duas opções, começando por Atlas pela simplicidade de conexão.

## Passo 1 — CI básico e variáveis/secrets

Crie os seguintes `secrets` e `variables` no GitHub (Settings → Secrets and variables → Actions):

Secrets (sempre secretos):
- `MONGO_URI` — conexão do MongoDB Atlas (ou DocumentDB) para produção.
- `POSTGRES_PASSWORD` — senha do usuário do Postgres em produção (RDS).
- `JWT_SECRET` — segredo do backend (exemplo de auth simples).

Variables (não sensíveis, podem ser variables):
- `AWS_REGION` — ex: `us-east-1`.
- `AWS_ACCOUNT_ID` — sua AWS account.
- `ECR_REPO_BACKEND` — ex: `devops-study-backend`.
- `S3_BUCKET_FRONTEND` — ex: `devops-study-frontend-bucket`.
- `CLOUDFRONT_DISTRIBUTION_ID` — se usar CloudFront para o frontend.

Observação: Se optar por chaves de acesso AWS (não recomendado), use `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` como secrets. Preferimos OIDC (ver Passo 2).

## Passo 2 — IAM via OIDC (recomendado)

Objetivo: permitir que o GitHub Actions assuma uma Role na AWS sem chaves. Resumo:

1. No IAM, crie um provedor OIDC: `token.actions.githubusercontent.com` (normalmente já suportado pelo `aws-actions/configure-aws-credentials`).
2. Crie uma Role IAM com trust policy para OIDC do GitHub, restringindo por `repo` e ambientes/branches conforme necessidade. Exemplo de condição: `repo:<owner>/<repo>:ref:refs/heads/main`.
3. Anexe políticas mínimas necessárias (ECR push/pull, ECS deploy, S3/CloudFront, RDS se necessário via Terraform), preferencialmente usando políticas administradas + políticas custom com princípio de menor privilégio.
4. Anote o `Role ARN` e use no workflow de CD.

Mais à frente adicionaremos trechos Terraform para automatizar isso.

## Passo 3 — Dev local com Docker

Usaremos `docker-compose.yml` com: Postgres, Mongo, backend e frontend. Para início, apenas Postgres e Mongo + backend/ frontend rodando em modo dev (ou containers simples de build). As credenciais de dev ficarão em `.env` (não comitar secrets de produção).

Variáveis exemplo para `.env` (dev local):

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=appdb
POSTGRES_PORT=5432

MONGO_URI=mongodb://mongo:27017/appdb
PORT=3000
VITE_API_URL=http://localhost:3000
```

## Passo 4 — Infra AWS (Terraform)

Provisionaremos com Terraform:
- VPC, subnets públicas/privadas, NAT
- RDS PostgreSQL (multi-AZ opcional)
- ECR (repositórios para imagens)
- ECS Fargate (serviço para backend)
- S3 + CloudFront (frontend estático)
- [Opcional] DocumentDB se optar por Mongo compatível na AWS

O `cd.yml` aplicará `terraform plan`/`apply` quando houver tag ou merge em `main` (a definir conforme estratégia).

## Passo 5 — Deploy

Pipeline de CD esperado:
1. Build da imagem do backend e push no ECR.
2. Terraform plan/apply para garantir infra atualizada.
3. Atualização do serviço no ECS para nova imagem.
4. Build do frontend e upload para S3; invalidar CloudFront.

## Próximos passos

- [ ] Adicionar scaffold do backend (Express) com rota `/health` e conexão Postgres/Mongo (lazy).
- [ ] Adicionar scaffold do frontend (Vite React) chamando `/health`.
- [ ] Adicionar `docker-compose.yml` para dev local.
- [ ] Completar `ci.yml` com lint/test/build.
- [ ] Esqueleto de Terraform com providers, backend, variáveis e módulos.
- [ ] Documentar Role OIDC (trust policy) e permissões mínimas.

## CI

- ...source code changes in a safe way (chaper 6)
- ...starting with a commit until the point where we have a package that can be deployed in production
- .. Agile practitioners know that a succesfull adoption cannot ignore the Agile engineering practices that directly affects the quality of the software being develop.
- ...the first sign of a good and disciplined programmer is how they manage changes to the system's source code
- Continues Delivery and DevOps require discipline and collaboration
- The delivery process of a disciplined team alwas starts with a commit
- Automation is one of the main pillars ofs DevOps and it is highlighted by several Agile engineering practices
