import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import userModel from '../src/dao/models/User.js';
import petModel from '../src/dao/models/Pet.js';
import adoptionModel from '../src/dao/models/Adoption.js';

// Base de datos SOLO para tests (no toca la base real)
const MONGO_URL_TEST = process.env.MONGO_URL_TEST || 'mongodb://127.0.0.1:27017/adoptme_test';

const requester = supertest(app);
const fakeId = new mongoose.Types.ObjectId().toString(); // id válido que no existe

describe('Tests funcionales del router de adopciones (/api/adoptions)', function () {
    let user;
    let pet;
    let adoptedPet;

    before(async function () {
        await mongoose.connect(MONGO_URL_TEST);

        user = await userModel.create({
            first_name: 'Test',
            last_name: 'Adopcion',
            email: `test_adopcion_${Date.now()}@correo.com`,
            password: '123456'
        });
        pet = await petModel.create({ name: 'Firulais', specie: 'dog', birthDate: new Date('2022-01-01') });
        adoptedPet = await petModel.create({ name: 'Michi', specie: 'cat', birthDate: new Date('2021-05-10'), adopted: true });
    });

    after(async function () {
        await adoptionModel.deleteMany({ owner: user._id });
        await petModel.deleteMany({ _id: { $in: [pet._id, adoptedPet._id] } });
        await userModel.deleteMany({ _id: user._id });
        await mongoose.disconnect();
    });

    describe('POST /api/adoptions/:uid/:pid', function () {
        it('Adopta una mascota disponible y responde 200', async function () {
            const { statusCode, body } = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.message).to.equal('Pet adopted');
        });

        it('Luego de adoptar, la mascota queda adoptada con dueño y el usuario la tiene en su lista', async function () {
            const petDb = await petModel.findById(pet._id).lean();
            const userDb = await userModel.findById(user._id).lean();
            const adoptionDb = await adoptionModel.findOne({ owner: user._id, pet: pet._id }).lean();

            expect(petDb.adopted).to.be.true;
            expect(petDb.owner.toString()).to.equal(user._id.toString());
            expect(userDb.pets.map(p => (p._id ?? p).toString())).to.include(pet._id.toString());
            expect(adoptionDb).to.not.be.null;
        });

        it('Responde 400 si la mascota ya está adoptada', async function () {
            const { statusCode, body } = await requester.post(`/api/adoptions/${user._id}/${adoptedPet._id}`);

            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Pet is already adopted');
        });

        it('Responde 404 si el usuario no existe', async function () {
            const { statusCode, body } = await requester.post(`/api/adoptions/${fakeId}/${pet._id}`);

            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
        });

        it('Responde 404 si la mascota no existe', async function () {
            const { statusCode, body } = await requester.post(`/api/adoptions/${user._id}/${fakeId}`);

            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Pet not found');
        });

        it('Responde 400 si los ids no tienen formato válido', async function () {
            const { statusCode, body } = await requester.post('/api/adoptions/123/abc');

            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
        });
    });

    describe('GET /api/adoptions', function () {
        it('Devuelve 200 y un array de adopciones', async function () {
            const { statusCode, body } = await requester.get('/api/adoptions');

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.payload).to.be.an('array');
            expect(body.payload.length).to.be.greaterThan(0);
        });
    });

    describe('GET /api/adoptions/:aid', function () {
        it('Devuelve 200 y la adopción cuando existe', async function () {
            const adoption = await adoptionModel.findOne({ owner: user._id }).lean();
            const { statusCode, body } = await requester.get(`/api/adoptions/${adoption._id}`);

            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.payload).to.have.property('_id', adoption._id.toString());
            expect(body.payload).to.have.property('owner');
            expect(body.payload).to.have.property('pet');
        });

        it('Responde 404 si la adopción no existe', async function () {
            const { statusCode, body } = await requester.get(`/api/adoptions/${fakeId}`);

            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Adoption not found');
        });

        it('Responde 400 si el id no tiene formato válido', async function () {
            const { statusCode, body } = await requester.get('/api/adoptions/id-invalido');

            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
        });
    });
});
