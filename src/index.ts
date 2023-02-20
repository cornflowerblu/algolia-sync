import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import algoliasearch from 'algoliasearch'
import { dbConnection, pgClient } from './db'


dotenv.config()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export const app: Express = express()
const port = process.env.NODE_PORT || 8080


app.get('/health', (req: Request, res: Response) => {
  res.json({
    timestamp: Date.now(),
    status: res.statusCode,
  })
})

app.get('/sync', async (req: Request, res: Response) => {
  if (req.query.key !== process.env.SYNC_KEY)
    return res.status(401).json({
      message: 'Unauthorized',
      status: res.statusCode,
    })

  const dataCheck = await pgClient.query(`
    SELECT EXISTS (
      SELECT FROM 
          pg_tables
      WHERE 
          schemaname = 'public' AND 
          tablename  = 'episodes'
      );
    `)

  if (dataCheck.rows[0].exists === false) {
    return res.status(200).json({
      message: 'No episodes to sync',
      status: res.statusCode,
    })
  }

  const data = await pgClient.query(`
      select episodes.id, episodes.name as name, episodes.description as description, s.name as show, s2.season_number, episode_number from episodes
      join episodes_show_links esl on episodes.id = esl.episode_id
      join episodes_season_links e on episodes.id = e.episode_id
      join shows s on esl.show_id = s.id
      join seasons s2 on e.season_id = s2.id
      order by show, season_number, episode_number asc;
`)

  try {
    const client = algoliasearch(
      process.env.ALG_APP_ID || '',
      process.env.ALG_API_KEY || '',
    )

    const index = client.initIndex('episodes')

    const episodes = data.rows.map((row: any) => {
      return {
        objectID: row.id,
        name: row.name,
        description: row.description,
        show: row.show,
        season: row.season_number,
        episode: row.episode_number,
      }
    })

    await index.saveObjects(episodes, { autoGenerateObjectIDIfNotExist: true })
    res.json({
      message: 'Synced',
      data: episodes,
      status: res.statusCode,
    })
  } catch (error) {
    console.log(error)
    res.status(200).json({
      message: 'Algolia Credentials not set',
      status: res.statusCode,
    })
  }
})

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
  return await dbConnection()
})
