# Pasos para terminar la entrega (en tu PC)

El proyecto ya está completo (base Adoptme + Entrega N°1 + Entrega Final).
Falta instalar, probar y publicar la imagen. Abrí una terminal en esta carpeta
(en VS Code: Terminal → New Terminal).

## Requisitos
- Node.js 20 o superior
- MongoDB local o una URL de MongoDB Atlas
- Docker Desktop (para la parte de Docker)

## 1. Instalar dependencias
```bash
npm install
```
Esto también crea el `package-lock.json`, que el Dockerfile necesita (`npm ci`).

## 2. Configurar la base de datos
Copiá `.env.example` como `.env` y poné tu URL de Mongo en `MONGO_URL`.

## 3. Probar
```bash
npm test     # 10 tests de /api/adoptions (usa la base adoptme_test)
npm start    # http://localhost:8080
```
- Swagger: http://localhost:8080/apidocs
- GET  http://localhost:8080/api/mocks/mockingpets
- GET  http://localhost:8080/api/mocks/mockingusers
- POST http://localhost:8080/api/mocks/generateData con body `{"users":10,"pets":20}`
  y después comprobar con GET /api/users y GET /api/pets

## 4. Docker
```bash
docker build -t luk45t/adoptme:1.0.0 .
docker login
docker push luk45t/adoptme:1.0.0
```
Reemplazá `luk45t` en README.md y docker-compose.yml por tu usuario de Docker Hub.

## Cambios respecto del repo base
- `app.js` exporta la app; `server.js` conecta a Mongo (por variable de entorno) y levanta el servidor.
- Nuevo router `/api/mocks` + módulo `utils/mocking.js` (Entrega N°1).
- Swagger del módulo Users en `src/docs/Users/Users.yaml`.
- Controller de adopciones con validación de ids y manejo de errores.
- `DELETE /api/users/:uid` ahora elimina de verdad (antes solo respondía "User deleted").
- Dependencias actualizadas (bcrypt 6, mongoose 8, jsonwebtoken 9, multer 2): las versiones viejas
  fallan al instalarse en Node actual sobre Windows o tienen vulnerabilidades conocidas.
- `.gitignore` ya no excluye la carpeta `test` e ignora `.env`.
