import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import { createClient } from "@vercel/postgres";
import { Server } from "socket.io";
import 'dotenv/config';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    try {
        const channel = message.channel,
            guild = channel.guild,
            everyone = guild.roles.everyone;
        
        if (!channel.permissionsFor(everyone).has(PermissionsBitField.Flags.ViewChannel))
            return;

        const sql_client = await createClient({
            connectionString:
                process.env.VERCEL_PGSQL,
        });

        await sql_client.connect();

        let authorData = (await message.guild.members.fetch(message.author.id))
        sql_client.query({
            // Note: All of these are apparently VARCHAR, except the last one is a BIGINT
            text: `insert into messages (authorName, authorImage, content, channel, time, uuid, guildid) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            values: [
                authorData.nickname ?? authorData.user.globalName ?? authorData.user.username,
                message.author.displayAvatarURL(),
                message.content.replace(/'+/gim, ""),
                message.channel.name,
                new Date(message.createdTimestamp).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/Indiana/Indianapolis",
                }),
                message.id,
                message.guildId ?? null,
            ],
        }).then(() => {
        }).catch(() => {});

        // Add Users to list
        if (message.mentions.users.size) {
            message.mentions.users.forEach(async user => {
                let userData = (await message.guild.members.fetch(user.id))
                const sql_user_client = await createClient({
                    connectionString:
                        process.env.VERCEL_PGSQL,
                });

                await sql_user_client.connect();
                // Add Users to list
                sql_user_client.query({
                    // Note: BIGINT, VARCHAR(32), BIGINT <= Your schema
                    // ALTER TABLE USERS ADD PRIMARY KEY (id);
                    text: `insert into users (id, name, colour) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET id = $1, name = $2, colour = $3;`,
                    values: [
                        userData.id,
                        userData.nickname ?? userData.user.globalName ?? userData.user.username,
                        userData.displayColor ?? 0
                    ],
                }).then(() => {
                    sql_user_client.end();
                }).catch(() => {});
            });
        }

        // Add Roles to list
        if (message.mentions.roles.size) {
            message.mentions.roles.forEach(async role => {
                let roleData = (await message.guild.roles.fetch(role.id))
                const sql_role_client = await createClient({
                    connectionString:
                        process.env.VERCEL_PGSQL,
                });

                await sql_role_client.connect();
                // Add Roles to list
                sql_role_client.query({
                    // Note: BIGINT, VARCHAR(32), BIGINT <= Your schema
                    // ALTER TABLE ROLES ADD PRIMARY KEY (id);
                    text: `insert into roles (id, name, colour) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET id = $1, name = $2, colour = $3;`,
                    values: [
                        roleData.id,
                        roleData.name,
                        roleData.color
                    ],
                }).then(() => {
                    sql_role_client.end();
                }).catch(() => {});
            });
        }


        // Check if the message mentions any channels
        if (message.mentions.channels.size) {
            message.mentions.channels.forEach(async channel => {
                let channelData = (await message.guild.channels.fetch(channel.id))
                const sql_channel_client = await createClient({
                    connectionString:
                        process.env.VERCEL_PGSQL,
                });

                await sql_channel_client.connect();
                // Add Channels to list
                sql_channel_client.query({
                    // Note: BIGINT, VARCHAR(32), BIGINT <= Your schema
                    // ALTER TABLE CHANNELS ADD PRIMARY KEY (id);
                    text: `insert into channels (id, name, colour) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET id = $1, name = $2, colour = $3;`,
                    values: [
                        channelData.id,
                        channelData.name,
                        0
                    ],
                }).then(() => {
                    sql_channel_client.end();
                }).catch(() => {});
            });
        }

    } catch (e) { }
    //await sql`delete from messages where ctid in (select ctid from messages order by time limit 1)`
});

client.login(
    process.env.BOT_TOKEN
);


const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
});

let current_map_seed = 1;
let current_game_stage = 1; // 0: landing, 1: buffering

let landers = {};
let lander_disconnect_timeouts = {};

let endgame_timer = 0.0;

setInterval(() => {
    for (let player_id in landers) {
        if (!landers[player_id]) continue;

        if (lander_disconnect_timeouts[player_id] > 0) {
            if (current_game_stage == 0) landers[player_id] = computeLanderPhysics(landers[player_id]); // Player missed a data frame! run the sim to keep them going!
        }

        if (lander_disconnect_timeouts[player_id] >= 50) { // 5 seconds
            io.emit("pl_crash", landers[player_id].x, landers[player_id].y);

            delete landers[player_id];
            delete lander_disconnect_timeouts[player_id];
        } else {
            lander_disconnect_timeouts[player_id]++;
        }
    }

    io.emit("landers", landers);
}, 200);

setInterval(() => {
    endgame_timer += 100;

    for (const player_id in landers) {
        if (!landers[player_id]) continue;

        if (landers[player_id].a == 0 && current_game_stage == 0)
            endgame_timer = 0;
    }

    io.emit("endgame_timer", endgame_timer);

    if (endgame_timer >= 6000) {
        endgame_timer = 0;

        if (current_game_stage == 0) {
            current_map_seed = Math.floor(
                Math.random() * Number.MAX_SAFE_INTEGER
            );
            current_game_stage = 1;

            io.emit("pl_map_change", current_map_seed);
            io.emit("pl_game_stage", current_game_stage);
        } else {
            current_game_stage = 0;

            io.emit("pl_game_stage", current_game_stage);
        }
    }
}, 100);

io.on("connection", (socket) => {
    socket.data.colour = [Math.random() * 255.0, Math.random() * 255.0, Math.random() * 255.0];

    socket.emit("pl_map_change", current_map_seed);
    socket.emit("pl_game_stage", current_game_stage);

    // game master functions
    socket.on("gm_map_change", (seed) => {
        current_map_seed = seed;

        io.emit("pl_map_change", seed);
    });

    socket.on("gm_stage", (stage) => {
        current_game_stage = stage;

        io.emit("pl_game_stage", current_game_stage);
    });

    // player functions
    socket.on("pl_lander_update", (x, y, r, vx, vy, vr, t, a) => {
        lander_disconnect_timeouts[socket.id] = 0;
        landers[socket.id] = {
            x: x,
            y: y,
            r: r,
            vx: vx,
            vy: vy,
            vr: vr,
            t: t,
            a: a,
            colour: socket.data.colour,
        };
    });

    socket.on("pl_crash", (x, y) => {
        io.emit("pl_crash", x, y);
    });

    socket.on("close", () => {
        io.emit("pl_crash", landers[socket.id].x, landers[socket.id].y);

        delete landers[socket.id];
        delete lander_disconnect_timeouts[socket.id];
    });
});

io.listen(5000);

const mapWidth = 1000;

const computeLanderPhysics = (lander) => {
    const deltaTime = 0.2;
    const thrust_power = 8;
    const gravity = 4;

    if (lander.a != 0) {
        lander.vx = 0;
        lander.vy = 0;
        lander.vr = 0;

        return lander;
    }

    lander.x += lander.vx * deltaTime;
    lander.y += lander.vy * deltaTime;
    lander.r += lander.vr * deltaTime;
    lander.vx += Math.sin(lander.r) * lander.t * thrust_power * deltaTime;
    lander.vy += (Math.cos(lander.r) * lander.t * thrust_power * deltaTime) - (gravity * deltaTime);

    if (lander.x > mapWidth) lander.x -= mapWidth;
    if (lander.x < 0) lander.x += mapWidth;

    return lander;
}