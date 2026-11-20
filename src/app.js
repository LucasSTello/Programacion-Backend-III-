import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(cookieParser());

// ---------- Swagger ----------
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Adoptme API',
            description: 'Documentación de la API de Adoptme',
            version: '1.0.0'
        }
    },
    apis: [path.join(__dirname, 'docs', '**', '*.yaml')]
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// ---------- Rutas ----------
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

// La app se exporta SIN app.listen() para poder testearla con supertest.
// El servidor se levanta en src/server.js
export default app;
