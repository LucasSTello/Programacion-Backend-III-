import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/adoptme';

try {
    await mongoose.connect(MONGO_URL);
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
} catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
}
