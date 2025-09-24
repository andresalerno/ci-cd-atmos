# Projeto DevOps: GitHub Actions + AWS (Node/React, PostgreSQL e Mongo)

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

