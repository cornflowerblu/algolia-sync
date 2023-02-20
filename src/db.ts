import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pgClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : false,
})

export const dbConnection = async () => {
  try {
    await pgClient.connect()
    console.log('Connected to database')
    const res = await pgClient.query('SELECT $1::text as message', [
      'Query Success!',
    ])
    console.log(res.rows[0].message)
  } catch (error) {
    console.log(error)
  }
}
