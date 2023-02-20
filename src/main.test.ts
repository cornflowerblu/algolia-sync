import supertest from 'supertest'
import dotenv from 'dotenv'

dotenv.config()

const requestWithSupertest = supertest(`http://localhost:${process.env.PORT}`)

describe('Health check', () => {
    it('should return 200', async () => {
        const response = await requestWithSupertest.get('/health')
        expect(response.status).toBe(200)
    })

    it('should return a timestamp that is not in the past', async () => {
        const response = await requestWithSupertest.get('/health')
        expect(response.body.timestamp).toBeGreaterThan(Date.now() - 1000)
    })
})

describe('Sync', () => {
    it('should return 401 if no key is provided', async () => {
        const response = await requestWithSupertest.get('/sync')
        expect(response.status).toBe(401)
    })

    it('should return 401 if an invalid key is provided', async () => {
        const response = await requestWithSupertest.get('/sync?key=invalid')
        expect(response.status).toBe(401)
    })

    it('should return 200 if a valid key is provided', async () => {
        const response = await requestWithSupertest.get(`/sync?key=${process.env.SYNC_KEY}`)
        expect(response.status).toBe(200)
    })
})