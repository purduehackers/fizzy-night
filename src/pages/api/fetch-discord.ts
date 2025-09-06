import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@vercel/postgres';

const fetchDiscord = async (req: NextApiRequest, res: NextApiResponse) => {
    const client = createClient({
        connectionString: process.env.POSTGRES_URL_NON_POOLING
    })
    await client.connect();

    const { rows: messages } = await client.sql`SELECT * FROM messages WHERE NOT ((content IS NULL OR content = '') AND (attachments IS NULL OR attachments = '')) ORDER BY uuid DESC LIMIT 6;`
    const { rows: users } = await client.sql`select * from users;`
    const { rows: roles } = await client.sql`select * from roles;`
    const { rows: channels } = await client.sql`select * from channels;`
    const { rows: attachments } = await client.sql`select * from attachments;`

    res.json({
        "messages": messages,
        "users": users,
        "roles": roles,
        "channels": channels,
        "attachments": attachments,
    });

    await client.end();
};

export default fetchDiscord;
