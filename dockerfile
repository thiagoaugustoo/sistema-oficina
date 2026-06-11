# Estágio 1: Instala e faz o build usando o Node 23
FROM node:23 AS builder
WORKDIR /app

# Copia tudo, incluindo o .env.production
COPY package*.json ./
RUN npm install
COPY . .

# O Vite vai ler automaticamente o .env.production aqui!
RUN npm run build

# Estágio 2: Pega o site pronto e serve no Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
