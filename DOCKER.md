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

## 🔧 Comandos Úteis

### Gerenciamento Básico

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
```

### Desenvolvimento

```bash
# Reconstruir após mudanças no código
docker-compose up -d --build

# Reconstruir sem cache
docker-compose build --no-cache

# Forçar recriação dos containers
docker-compose up -d --force-recreate
```

### Acesso aos Containers

```bash
# Acessar terminal do backend
docker exec -it mobilemed-backend sh

# Acessar terminal do frontend
docker exec -it mobilemed-frontend sh

# Acessar MySQL
docker exec -it mobilemed-db mysql -u mobilemed_user -p
# Senha: mobilemed_pass

# Executar comandos no backend sem entrar no container
docker exec -it mobilemed-backend npm run seed
docker exec -it mobilemed-backend npx prisma studio
```

### Limpeza

```bash
# Parar e remover containers
docker-compose down

# Parar e remover containers + volumes (APAGA DADOS)
docker-compose down -v

# Remover imagens não utilizadas
docker image prune -a

# Limpeza completa do sistema Docker
docker system prune -a --volumes
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar se a porta já está em uso
lsof -i :3000  # Backend
lsof -i :80    # Frontend
lsof -i :3306  # Database
```

### Erro de conexão com banco de dados

1. Verifique se o container do database está saudável:
```bash
docker-compose ps
```

2. Teste a conexão manualmente:
```bash
docker exec -it mobilemed-db mysqladmin ping -h localhost -u root -prootpassword
```

3. Reinicie os serviços:
```bash
docker-compose restart
```

### Banco de dados não persiste dados

Verifique se o volume existe:
```bash
docker volume ls | grep mysql
```

Se não existir, recrie:
```bash
docker-compose down -v
docker-compose up -d
```

### Build falha

Limpe o cache e reconstrua:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Frontend não carrega

1. Verifique se o backend está rodando:
```bash
curl http://localhost:3000/pacientes
```

2. Verifique logs do Nginx:
```bash
docker-compose logs frontend
```

3. Reconstrua o frontend:
```bash
docker-compose up -d --build frontend
```

### Migrations não executam

Execute manualmente:
```bash
docker exec -it mobilemed-backend npx prisma migrate deploy
```

## 🔐 Segurança

### Produção

Para produção, **SEMPRE** altere as credenciais padrão:

1. Crie um arquivo `.env` na raiz:
```env
MYSQL_ROOT_PASSWORD=sua_senha_super_secreta
MYSQL_DATABASE=mobilemed_prod
MYSQL_USER=mobilemed_prod_user
MYSQL_PASSWORD=senha_forte_aqui
```

2. Atualize o `docker-compose.yml` para usar variáveis de ambiente:
```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  MYSQL_DATABASE: ${MYSQL_DATABASE}
  MYSQL_USER: ${MYSQL_USER}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

## 📊 Monitoramento

### Ver uso de recursos

```bash
# Ver uso de CPU e memória
docker stats

# Ver uso de disco dos volumes
docker system df -v
```

### Healthchecks

```bash
# Status dos healthchecks
docker-compose ps

# Verificar health do database
docker inspect mobilemed-db | grep -A 10 Health

# Verificar health do backend
docker inspect mobilemed-backend | grep -A 10 Health
```

## 🔄 Backup e Restore

### Backup do banco de dados

```bash
# Criar backup
docker exec mobilemed-db mysqldump -u root -prootpassword mobilemed_db > backup.sql

# Ou com compressão
docker exec mobilemed-db mysqldump -u root -prootpassword mobilemed_db | gzip > backup.sql.gz
```

### Restore do banco de dados

```bash
# Restaurar de backup
docker exec -i mobilemed-db mysql -u root -prootpassword mobilemed_db < backup.sql

# Ou de arquivo comprimido
gunzip < backup.sql.gz | docker exec -i mobilemed-db mysql -u root -prootpassword mobilemed_db
```

## 🚀 Deploy em Produção

### Usando Docker Compose em servidor

1. **Instale Docker e Docker Compose no servidor**

2. **Clone o repositório:**
```bash
git clone <repo-url>
cd desafio-tecnico-III
```

3. **Configure variáveis de ambiente:**
```bash
cp .env.example .env
# Edite .env com credenciais seguras
```

4. **Inicie os serviços:**
```bash
docker-compose up -d
```

5. **Configure SSL/HTTPS** (recomendado):
- Use Nginx Proxy Manager
- Ou adicione certificados Let's Encrypt

### Usando Docker em serviços cloud

**AWS ECS / Azure Container Instances / Google Cloud Run:**
- Faça push das imagens para um registry (Docker Hub, ECR, etc.)
- Configure o serviço para usar as imagens
- Configure variáveis de ambiente
- Configure banco de dados gerenciado (RDS, Azure DB, Cloud SQL)

## 📝 Arquivos Docker

### Dockerfile do Backend

- **Multi-stage build** para otimizar tamanho
- Gera Prisma Client no build
- Executa migrações automaticamente na inicialização
- Usa imagem Alpine (menor)

### Dockerfile do Frontend

- Build da aplicação Angular em produção
- Serve via Nginx
- Configuração otimizada com cache e gzip
- Suporte a rotas do Angular (SPA)

### docker-compose.yml

- Orquestra 3 serviços (db, backend, frontend)
- Network bridge para comunicação
- Volume persistente para MySQL
- Healthchecks configurados
- Dependências entre serviços

## ✅ Checklist Docker

- [ ] Docker e Docker Compose instalados
- [ ] Portas 80, 3000 e 3306 disponíveis
- [ ] `docker-compose up -d` executado com sucesso
- [ ] Todos os containers em status "Up"
- [ ] Banco de dados populado (`npm run seed`)
- [ ] Frontend acessível em http://localhost
- [ ] Backend respondendo em http://localhost:3000
- [ ] Logs sem erros críticos

---

**Pronto! Sua aplicação está rodando em containers! 🐳**
