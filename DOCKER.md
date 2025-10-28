# 🐳 Guia Docker - MobileMed

## 📦 Arquitetura dos Containers

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │   Database   │ │
│  │   (Nginx)    │  │   (NestJS)   │  │   (MySQL)    │ │
│  │   Port: 80   │  │  Port: 3000  │  │  Port: 3306  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│              mobilemed-network (bridge)                 │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Início Rápido

### 1. Iniciar toda a aplicação

```bash
docker-compose up -d
```

### 2. Verificar status dos containers

```bash
docker-compose ps
```

Você verá algo como:
```
NAME                   STATUS        PORTS
mobilemed-backend      Up 30s        0.0.0.0:3000->3000/tcp
mobilemed-frontend     Up 25s        0.0.0.0:80->80/tcp
mobilemed-db           Up 35s        0.0.0.0:3306->3306/tcp
```

### 3. Popular o banco de dados

```bash
docker exec -it mobilemed-backend npm run seed
```

### 4. Acessar a aplicação

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **Exemplo API:** http://localhost:3000/pacientes

## 📋 Serviços

### Database (MySQL)

**Container:** `mobilemed-db`  
**Imagem:** `mysql:8.0`  
**Porta:** `3306`

**Credenciais padrão:**
- Root Password: `rootpassword`
- Database: `mobilemed_db`
- User: `mobilemed_user`
- Password: `mobilemed_pass`

**Volume:** `mysql_data` (persistência de dados)

**Healthcheck:** Verifica se o MySQL está respondendo a cada 10s

### Backend (NestJS)

**Container:** `mobilemed-backend`  
**Build:** `./backend/Dockerfile`  
**Porta:** `3000`

**Variáveis de ambiente:**
- `DATABASE_URL`: Conexão com MySQL
- `NODE_ENV`: production
- `PORT`: 3000

**Processo:**
1. Build em multi-stage (otimizado)
2. Gera Prisma Client
3. Executa migrações automaticamente
4. Inicia servidor em modo produção

### Frontend (Angular + Nginx)

**Container:** `mobilemed-frontend`  
**Build:** `./frontend/Dockerfile`  
**Porta:** `80`

**Processo:**
1. Build da aplicação Angular
2. Serve arquivos estáticos via Nginx
3. Configuração otimizada com cache e gzip

## Erro

### Ao rodar seed

Caso as tabelas não tenham sido criadas no banco de dados, utilize este comando:

```bash
docker exec -it mobilemed-backend npx prisma db push
```

(Em um cenário real, o correto seria utilizar migrations)
