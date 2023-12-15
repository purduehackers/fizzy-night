import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@vercel/postgres';

const fetchPosts = async (req: NextApiRequest, res: NextApiResponse) => {
    const client = createClient({
        connectionString: process.env.POSTGRES_URL_NON_POOLING
    })
    await client.connect();

    const { rows } = await client.sql`select * from messages order by ctid desc limit 6;`

    res.json(rows);

    await client.end();
};

export default fetchPosts;
