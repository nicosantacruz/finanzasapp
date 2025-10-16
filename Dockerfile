# Dockerfile para desarrollo
FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["pnpm", "dev"]
