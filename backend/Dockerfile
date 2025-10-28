# Build stage
FROM node:24-alpine AS build

WORKDIR /app

# Instalar OpenSSL
RUN apk add --no-cache openssl

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Instalar OpenSSL
RUN apk add --no-cache openssl

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Instalar tsx para executar o seed
RUN npm install -g tsx

# Copiar Prisma Client gerado
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Copiar build da aplicação
COPY --from=build /app/dist ./dist

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["sh", "-c", "npx prisma db push && node dist/src/main"]
