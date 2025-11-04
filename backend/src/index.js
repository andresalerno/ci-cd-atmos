import express from 'express';
import pkg from 'pg';
import { MongoClient } from 'mongodb';

const app = express();
const port = process.env.PORT || 3000;

// Lazy clients (tentam conectar sob demanda)
const { Pool } = pkg;
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'appdb',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10)
});

let mongoClient;
const getMongoClient = async () => {
  if (!mongoClient) {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/appdb';
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  }
  console.log("ehehehe")
  return mongoClient;
};

app.get('/health', async (req, res) => {
  try {
    // Teste rápido de Postgres
    await pgPool.query('SELECT 1');
    // Teste rápido de Mongo
    const mc = await getMongoClient();
    await mc.db().command({ ping: 1 });
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

