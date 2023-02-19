import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import algoliasearch from 'algoliasearch';
import { Client } from 'pg'

process.env.NODE_TLS_REJECT_UNAUTHORIZED || '1'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const client = algoliasearch(process.env.ALG_APP_ID || '', process.env.ALG_API_KEY || '');
const index = client.initIndex('episodes');

const pgClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : false,
});

const connection = async () => {
    try {
        await pgClient.connect();
        console.log('Connected to database');
        const res = await pgClient.query('SELECT $1::text as message', ['Query Success!'])
        console.log(res.rows[0].message)
    } catch (error) {
        console.log(error);
    }
}

const prepData = async () => await pgClient.query(`
    select episodes.id, episodes.name as name, episodes.description as description, s.name as show, s2.season_number, episode_number from episodes
    join episodes_show_links esl on episodes.id = esl.episode_id
    join episodes_season_links e on episodes.id = e.episode_id
    join shows s on esl.show_id = s.id
    join seasons s2 on e.season_id = s2.id
    order by show, season_number, episode_number asc;
`)


app.get('/health', (req: Request, res: Response) => {
    res.json({
        timestamp: Date.now(),
        status: res.statusCode
    })
});

app.get('/sync', async (req: Request, res: Response) => {
    const data = await prepData();
    const episodes = data.rows.map((row: any) => {
        return {
            objectID: row.id,
            name: row.name,
            description: row.description,
            show: row.show,
            season: row.season_number,
            episode: row.episode_number
        }
    });

    await index.saveObjects(episodes, { autoGenerateObjectIDIfNotExist: true });
    res.json({
        message: 'Synced',
        data: episodes,
        status: res.statusCode
    })
})

app.listen(port, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    await connection();
});