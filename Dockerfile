# Imagen base oficial de Node (Debian slim: compatible con los binarios precompilados de bcrypt)
FROM node:20-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# 1) Copiamos primero solo los manifiestos para aprovechar la caché de capas
COPY package.json package-lock.json ./

# 2) Instalación reproducible (respeta exactamente el package-lock.json) sin devDependencies
RUN npm ci --omit=dev

# 3) Copiamos el código fuente con dueño "node" (usuario sin privilegios)
COPY --chown=node:node src ./src

# 4) Ejecutamos como usuario no root
USER node

EXPOSE 8080

CMD ["node", "src/server.js"]
