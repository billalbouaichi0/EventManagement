import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'event_management';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

export async function ensureDatabaseExists() {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      connectTimeout: 10000
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
  } catch (err) {
    // Database likely already exists
  }
}

await ensureDatabaseExists();

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
    decimalNumbers: true
  },
  pool: {
    max: 30,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});
