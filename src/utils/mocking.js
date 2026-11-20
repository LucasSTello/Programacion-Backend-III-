import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const ROLES = ['user', 'admin'];
const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish'];

// La contraseña "coder123" se encripta una sola vez y se reutiliza
// (bcrypt es lento a propósito; hashear 50 veces haría muy lento el endpoint)
let hashedPassword = null;
const getHashedPassword = async () => {
    if (!hashedPassword) hashedPassword = await bcrypt.hash('coder123', 10);
    return hashedPassword;
};

/**
 * Genera usuarios con el mismo formato que devolvería MongoDB
 * (_id de tipo ObjectId y __v), password "coder123" encriptada,
 * role aleatorio entre "user" y "admin" y pets como array vacío.
 */
export const generateMockUsers = async (quantity = 50) => {
    const password = await getHashedPassword();
    const users = [];

    for (let i = 0; i < quantity; i++) {
        const first_name = faker.person.firstName();
        const last_name = faker.person.lastName();
        users.push({
            _id: new mongoose.Types.ObjectId(),
            first_name,
            last_name,
            // se agrega un sufijo único para no chocar con el índice unique de email
            email: faker.internet.email({ firstName: first_name, lastName: last_name, provider: `mock${i}.com` }).toLowerCase(),
            password,
            role: faker.helpers.arrayElement(ROLES),
            pets: [],
            __v: 0
        });
    }
    return users;
};

/**
 * Genera mascotas con el formato del modelo Pet.
 */
export const generateMockPets = (quantity = 100) => {
    const pets = [];

    for (let i = 0; i < quantity; i++) {
        pets.push({
            _id: new mongoose.Types.ObjectId(),
            name: faker.animal.petName(),
            specie: faker.helpers.arrayElement(SPECIES),
            birthDate: faker.date.past({ years: 10 }),
            adopted: false,
            image: faker.image.url(),
            __v: 0
        });
    }
    return pets;
};
