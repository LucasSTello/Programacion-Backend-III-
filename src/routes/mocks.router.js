import { Router } from 'express';
import { generateMockUsers, generateMockPets } from '../utils/mocking.js';
import userModel from '../dao/models/User.js';
import petModel from '../dao/models/Pet.js';

const router = Router();

// Convierte un parámetro a entero positivo, o devuelve null si no es válido
const toPositiveInt = (value, defaultValue) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    const n = Number(value);
    return Number.isInteger(n) && n >= 0 ? n : null;
};

// GET /api/mocks/mockingpets?num=100  (endpoint del primer desafío, migrado a este router)
router.get('/mockingpets', (req, res) => {
    const num = toPositiveInt(req.query.num, 100);
    if (num === null) return res.status(400).send({ status: 'error', error: 'El parámetro num debe ser un entero positivo' });

    const pets = generateMockPets(num);
    res.send({ status: 'success', payload: pets });
});

// GET /api/mocks/mockingusers  → 50 usuarios por defecto (se puede cambiar con ?num=)
router.get('/mockingusers', async (req, res) => {
    try {
        const num = toPositiveInt(req.query.num, 50);
        if (num === null) return res.status(400).send({ status: 'error', error: 'El parámetro num debe ser un entero positivo' });

        const users = await generateMockUsers(num);
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

// POST /api/mocks/generateData  body: { "users": 10, "pets": 20 }
// Genera e inserta en la base de datos la cantidad de registros indicada
router.post('/generateData', async (req, res) => {
    try {
        const usersQty = toPositiveInt(req.body?.users ?? req.query.users, 0);
        const petsQty = toPositiveInt(req.body?.pets ?? req.query.pets, 0);

        if (usersQty === null || petsQty === null) {
            return res.status(400).send({ status: 'error', error: 'Los parámetros users y pets deben ser enteros positivos' });
        }
        if (usersQty === 0 && petsQty === 0) {
            return res.status(400).send({ status: 'error', error: 'Indicá al menos un valor mayor a 0 en users o pets' });
        }

        const users = await generateMockUsers(usersQty);
        const pets = generateMockPets(petsQty);

        const insertedUsers = usersQty ? await userModel.insertMany(users) : [];
        const insertedPets = petsQty ? await petModel.insertMany(pets) : [];

        res.status(201).send({
            status: 'success',
            message: 'Datos generados e insertados correctamente',
            payload: {
                users: insertedUsers.length,
                pets: insertedPets.length
            }
        });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

export default router;
