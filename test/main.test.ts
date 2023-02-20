import request from 'supertest'
import dotenv from 'dotenv'
import { app } from '../src/index'

dotenv.config()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Health check', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBeGreaterThanOrEqual(500)
  })

  it('should return a timestamp that is not in the past', async () => {
    const response = await request(app).get('/health')
    expect(response.body.timestamp).toBeGreaterThan(Date.now() - 1000)
  })
})

describe('Sync', () => {
  it('should return 401 if no key is provided', async () => {
    const response = await request(app).get('/sync')
    expect(response.status).toBe(401)
  })

  it('should return 401 if an invalid key is provided', async () => {
    const response = await request(app).get('/sync?key=invalid')
    expect(response.status).toBe(401)
  })
})
