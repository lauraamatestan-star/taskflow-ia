require('dotenv').config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PORT) {
  throw new Error('La variable PORT no está definida en .env');
}

module.exports = {
  PORT,
  NODE_ENV
};