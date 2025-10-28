# 🚀 Guia de Configuração e Execução do Projeto

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **npm** (v9 ou superior)
- **Banco de Dados MySQL** ou **PostgreSQL**
- **Git**

**OU**

- **Docker** e **Docker Compose** (para execução rápida via containers)

## 🗂️ Estrutura do Projeto

```
desafio-tecnico-III/
├── backend/              # API NestJS
│   ├── Dockerfile        # Docker image do backend
│   └── .dockerignore
├── frontend/             # Aplicação Angular
│   ├── Dockerfile        # Docker image do frontend
│   ├── nginx.conf        # Configuração do Nginx
│   └── .dockerignore
├── docker-compose.yml    # Orquestração dos containers
├── README.md             # Descrição do desafio
└── README_SETUP.md       # Este arquivo
```

---

## � Início Rápido com Docker (Recomendado)

### Executar toda a aplicação com um comando

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso irá:
1. ✅ Criar e iniciar o banco de dados MySQL
2. ✅ Construir e iniciar o backend (API NestJS)
3. ✅ Executar as migrações do Prisma
4. ✅ Construir e iniciar o frontend (Angular + Nginx)

**Acessos:**
- Frontend: **http://localhost**
- Backend API: **http://localhost:3000**
- Banco de Dados: **localhost:3306**

### Popular o banco de dados

```bash
# Entrar no container do backend
docker exec -it mobilemed-backend sh

# Executar o seed
npm run seed

# Sair do container
exit
```

### Verificar logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs do backend apenas
docker-compose logs -f backend

# Ver logs do frontend apenas
docker-compose logs -f frontend
```

### Parar a aplicação

```bash
docker-compose down
```

### Parar e remover volumes (limpar dados)

```bash
docker-compose down -v
```

### Reconstruir após mudanças no código

```bash
docker-compose up -d --build
```

---

## 🔧 Configuração Manual (Sem Docker)

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

Crie um banco de dados MySQL ou PostgreSQL:

**MySQL:**
```sql
CREATE DATABASE mobilemed_db;
```

**PostgreSQL:**
```sql
CREATE DATABASE mobilemed_db;
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

**Para MySQL:**
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/mobilemed_db"
```

**Para PostgreSQL:**
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mobilemed_db?schema=public"
```

### 4. Executar Migrações do Prisma

```bash
# Gerar o Prisma Client
npx prisma generate

# Criar as tabelas no banco de dados
npx prisma db push

# Ou usar migrações (recomendado para produção)
npx prisma migrate dev --name init
```

### 5. Popular o Banco de Dados (Seed)

```bash
npm run seed
```

Isso criará:
- 30 pacientes com dados aleatórios
- 1 a 5 exames para cada paciente com modalidades DICOM variadas

### 6. Executar o Backend

**Modo desenvolvimento (com hot-reload):**
```bash
npm run start:dev
```

**Modo produção:**
```bash
npm run build
npm run start:prod
```

O backend estará disponível em: **http://localhost:3000**

### 7. Verificar Endpoints

- **GET** `http://localhost:3000/pacientes?page=1&pageSize=10` - Listar pacientes
- **POST** `http://localhost:3000/pacientes` - Criar paciente
- **GET** `http://localhost:3000/exames?page=1&pageSize=10` - Listar exames
- **POST** `http://localhost:3000/exames` - Criar exame (requer header `X-Idempotency-Key`)

---

## 🎨 Configuração do Frontend

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Verificar Configuração da API

O frontend está configurado para acessar a API em `http://localhost:3000`.

Se você mudou a porta do backend, edite os arquivos:
- `src/app/services/patient-data.ts`
- `src/app/services/exam-data.ts`

Altere a linha:
```typescript
private apiUrl = 'http://localhost:3000/pacientes'; // ou /exames
```

### 3. Executar o Frontend

```bash
npm start
```

O frontend estará disponível em: **http://localhost:4200**

### 4. Acessar a Aplicação

1. Abra o navegador em `http://localhost:4200`
2. Navegue para a lista de pacientes
3. Crie novos pacientes e exames
4. Teste a paginação e validações

---

## 🧪 Executar Testes

### Testes do Backend

**Testes Unitários:**
```bash
cd backend
npm test
```

**Testes E2E (End-to-End):**
```bash
npm run test:e2e
```

**Cobertura de Código:**
```bash
npm run test:cov
```

O relatório de cobertura será gerado em `backend/coverage/lcov-report/index.html`

### Testes do Frontend

**Testes Unitários:**
```bash
cd frontend
npm test
```

**Testes em modo headless (CI/CD):**
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

**Cobertura de Código:**
```bash
npm test -- --code-coverage --watch=false
```

O relatório será gerado em `frontend/coverage/index.html`

---

## 📦 Scripts Disponíveis

### Backend

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor |
| `npm run start:dev` | Inicia com hot-reload |
| `npm run start:prod` | Inicia em modo produção |
| `npm run build` | Compila o projeto |
| `npm test` | Executa testes unitários |
| `npm run test:e2e` | Executa testes E2E |
| `npm run test:cov` | Gera relatório de cobertura |
| `npm run seed` | Popula banco com dados de teste |
| `npx prisma studio` | Abre interface visual do banco |
| `npx prisma migrate dev` | Cria nova migração |
| `npx prisma generate` | Gera Prisma Client |

### Frontend

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm test` | Executa testes unitários |
| `npm run lint` | Executa linter |

---

## 🐳 Comandos Docker Úteis

### Docker Compose

| Comando | Descrição |
|---------|-----------|
| `docker-compose up -d` | Inicia todos os serviços em background |
| `docker-compose up -d --build` | Reconstrói e inicia os serviços |
| `docker-compose down` | Para todos os serviços |
| `docker-compose down -v` | Para e remove volumes (limpa dados) |
| `docker-compose logs -f` | Visualiza logs em tempo real |
| `docker-compose ps` | Lista serviços em execução |
| `docker-compose restart backend` | Reinicia apenas o backend |

### Containers Individuais

| Comando | Descrição |
|---------|-----------|
| `docker exec -it mobilemed-backend sh` | Acessa terminal do backend |
| `docker exec -it mobilemed-frontend sh` | Acessa terminal do frontend |
| `docker exec -it mobilemed-db mysql -u root -p` | Acessa MySQL no container |
| `docker logs mobilemed-backend` | Ver logs do backend |
| `docker logs mobilemed-frontend` | Ver logs do frontend |

### Gestão de Imagens e Volumes

| Comando | Descrição |
|---------|-----------|
| `docker images` | Lista imagens Docker |
| `docker volume ls` | Lista volumes Docker |
| `docker system prune -a` | Remove recursos não utilizados |
| `docker-compose build --no-cache` | Reconstrói sem cache |

---