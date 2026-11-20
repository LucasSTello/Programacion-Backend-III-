# 🐾 Adoptme API — Entrega Final (Backend III)

API REST para la gestión de adopciones de mascotas (usuarios, mascotas, adopciones y sesiones), construida con **Node.js, Express y MongoDB (Mongoose)**, documentada con **Swagger**, testeada con **Mocha + Chai + Supertest** y dockerizada.

## 🐳 Imagen en Docker Hub

👉 **https://hub.docker.com/r/luk45t/adoptme**

```bash
docker pull luk45t/adoptme:1.0.0
```

---

## 📁 Estructura relevante

```
├── src/
│   ├── app.js                 # Configuración de Express, rutas y Swagger (exporta la app)
│   ├── server.js              # Conexión a MongoDB + app.listen()
│   ├── routes/mocks.router.js # Router de mocks (/api/mocks)
│   ├── utils/mocking.js       # Módulo de mocking de usuarios y mascotas
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── dao/
│   └── docs/Users/Users.yaml  # Documentación Swagger del módulo Users
├── test/
│   └── adoption.router.test.js
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
└── .env.example
```

## ⚙️ Variables de entorno

| Variable         | Descripción                              | Valor por defecto                          |
|------------------|------------------------------------------|--------------------------------------------|
| `PORT`           | Puerto del servidor                      | `8080`                                     |
| `MONGO_URL`      | URL de conexión a MongoDB                | `mongodb://127.0.0.1:27017/adoptme`        |
| `MONGO_URL_TEST` | Base de datos usada por los tests        | `mongodb://127.0.0.1:27017/adoptme_test`   |

Copiá `.env.example` a `.env` y ajustá los valores (por ejemplo, tu URL de MongoDB Atlas).

---

## 💻 Ejecución local (sin Docker)

```bash
npm install
npm start          # levanta el servidor en http://localhost:8080
```

## 📚 Documentación (Swagger)

Con el servidor levantado, ingresar a:

**http://localhost:8080/apidocs**

Ahí está documentado el módulo **Users**:

| Método | Endpoint            | Descripción               |
|--------|---------------------|---------------------------|
| GET    | `/api/users`        | Lista todos los usuarios  |
| GET    | `/api/users/{uid}`  | Obtiene un usuario por ID |
| PUT    | `/api/users/{uid}`  | Actualiza un usuario      |
| DELETE | `/api/users/{uid}`  | Elimina un usuario        |

## 🎲 Mocks (Entrega N°1)

Router `src/routes/mocks.router.js` bajo la ruta base `/api/mocks`, usando el módulo de mocking `src/utils/mocking.js` (Faker).

| Método | Endpoint                     | Descripción |
|--------|------------------------------|-------------|
| GET    | `/api/mocks/mockingpets`     | Genera mascotas falsas (100 por defecto, `?num=` para cambiar la cantidad). No las guarda. |
| GET    | `/api/mocks/mockingusers`    | Genera 50 usuarios con formato de documento de Mongo (`_id`, `__v`), password `coder123` encriptada con bcrypt, `role` aleatorio `user`/`admin` y `pets: []`. No los guarda. |
| POST   | `/api/mocks/generateData`    | Recibe `{ "users": n, "pets": m }`, genera esa cantidad de registros y **los inserta en MongoDB**. |

**Ejemplo y comprobación:**

```bash
curl -X POST http://localhost:8080/api/mocks/generateData \
  -H "Content-Type: application/json" \
  -d '{"users": 10, "pets": 20}'

# Comprobar con los servicios GET existentes
curl http://localhost:8080/api/users
curl http://localhost:8080/api/pets
```

> En Windows (PowerShell):
> `Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/mocks/generateData -ContentType "application/json" -Body '{"users":10,"pets":20}'`

## 🧪 Tests funcionales

Los tests cubren todos los endpoints de `adoption.router.js`, con casos de éxito y de error:

| Endpoint                          | Casos testeados                                                                 |
|-----------------------------------|---------------------------------------------------------------------------------|
| `GET /api/adoptions`              | 200 con array de adopciones                                                     |
| `GET /api/adoptions/:aid`         | 200 si existe · 404 si no existe · 400 si el id es inválido                     |
| `POST /api/adoptions/:uid/:pid`   | 200 adopción exitosa (y se verifica en la BD) · 400 mascota ya adoptada · 404 usuario inexistente · 404 mascota inexistente · 400 ids inválidos |

Requieren un MongoDB accesible en `MONGO_URL_TEST` (usan una base separada y limpian los datos que crean).

```bash
npm test
```

> Tip: si no tenés Mongo instalado, podés levantar uno con Docker:
> `docker run -d --name mongo-test -p 27017:27017 mongo:7`

---

## 🐳 Docker

### 1. Construir la imagen

```bash
docker build -t luk45t/adoptme:1.0.0 .
```

### 2. Ejecutar el contenedor

La imagen no incluye MongoDB: hay que pasarle la URL por variable de entorno.

**Con MongoDB Atlas:**
```bash
docker run -d -p 8080:8080 \
  -e MONGO_URL="mongodb+srv://usuario:password@cluster.mongodb.net/adoptme" \
  --name adoptme luk45t/adoptme:1.0.0
```

**Con Docker Compose (levanta la app + un Mongo local):**
```bash
docker compose up -d
```

Luego ingresar a `http://localhost:8080/apidocs`.

### 3. Subir la imagen a Docker Hub

```bash
docker login
docker push luk45t/adoptme:1.0.0
```

### 4. Usar la imagen publicada (desde cualquier máquina)

```bash
docker pull luk45t/adoptme:1.0.0
docker run -d -p 8080:8080 -e MONGO_URL="<tu-url-de-mongo>" luk45t/adoptme:1.0.0
```

### Comandos útiles

```bash
docker ps                 # ver contenedores corriendo
docker logs adoptme       # ver logs de la app
docker stop adoptme       # detener el contenedor
docker compose down       # bajar todo lo levantado con compose
```

---

## 🛠️ Tecnologías

Node.js · Express · MongoDB / Mongoose · Faker · Swagger (swagger-jsdoc + swagger-ui-express) · Mocha · Chai · Supertest · Docker

## 👤 Autor

Lucas Tello
