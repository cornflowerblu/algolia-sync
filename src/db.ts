import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

let ssl: boolean | undefined
if (process.env.NODE_ENV == 'production') {
  ssl = true
} else {
  ssl = false
}

export const pgClient = new Client({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres',
  ssl: true
})

export const dbConnection = async () => {
  await pgClient.connect()
  console.log('Connected to database')
  const res = await pgClient.query('SELECT $1::text as message', [
    'Query Success!',
  ])
  console.log(res.rows[0].message)
}
