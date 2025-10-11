import { Client, GatewayIntentBits, PermissionsBitField, StickerFormatType } from "discord.js";
import { createPool } from "@vercel/postgres";
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
        // Pass message, false (Not Edited)
        await processDiscordMessage(message, false);
    } catch (e) { }
        //purgeOldMessages()
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
    try {
        // Pass message, true (Edited)
        await processDiscordMessage(newMessage, true);
    } catch (e) { }
});

client.on("messageDelete", async (message) => {
    try {
        // Pass message, true (Edited)
        await deleteDiscordMessage(message);
    } catch (e) { console.log(e) }
});

client.on("messageDeleteBulk", async (messages) => {
    try {
        messages.forEach(async message => {
            // Pass message, true (Edited)
            await deleteDiscordMessage(message);
        });
    } catch (e) { }
    //await purgeOldMessages()
});

client.login(
    process.env.BOT_TOKEN
);


const io = new Server({
    cors: {
        origin: "https://night.purduehackers.com"
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

async function purgeOldMessages() {
      const sql_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });
      const sql_user_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });
    const sql_role_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });
    const sql_channel_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });
    const sql_attachment_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });

    await sql_client.connect();
    // Delete old messages
    sql_client.query({
        text: `delete from messages where ctid in (select ctid from messages order by ctid asc limit greatest((select (select count(*) from messages) - 100), 0));`,
    }).then(() => {
        sql_client.end();
    }).catch((e) => { console.log(e) });

    await sql_user_client.connect();
    // Delete old users
    sql_user_client.query({
        text: `delete from users where ctid in (select ctid from users order by uudi asc limit greatest((select (select count(*) from users) - 1000), 0));`,
    }).then(() => {
        sql_user_client.end();
    }).catch((e) => { console.log(e) });

    await sql_role_client.connect();
    // Delete old roles
    sql_role_client.query({
        text: `delete from roles where ctid in (select ctid from roles order by ctid asc limit greatest((select (select count(*) from roles) - 100), 0));`,
    }).then(() => {
        sql_role_client.end();
    }).catch((e) => { console.log(e) });

    await sql_channel_client.connect();
    // Delete old channels
    sql_channel_client.query({
        text: `delete from channels where ctid in (select ctid from channels order by ctid asc limit greatest((select (select count(*) from channels) - 100), 0));`,
    }).then(() => {
        sql_channel_client.end();
    }).catch((e) => { console.log(e) });

    await sql_attachment_client.connect();
    // Delete old attachments
    sql_attachment_client.query({
        text: `delete from attachments where ctid in (select ctid from attachments order by ctid asc limit greatest((select (select count(*) from attachments) - 200), 0));`,
    }).then(() => {
        sql_attachment_client.end();
    }).catch((e) => { console.log(e) });
}

async function processDiscordMessage(message, edited) {
    const channel = message.channel,
        guild = channel.guild,
        everyone = guild.roles.everyone;

    if (!channel.permissionsFor(everyone).has(PermissionsBitField.Flags.ViewChannel))
        return;

    const sql_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });

    await sql_client.connect();

    let authorData = (await message.guild.members.fetch(message.author.id))

    let attachmentIds = null;
    message.attachments.forEach(async attachments => {
        if (attachmentIds == null) {
            attachmentIds = [];
        }
        attachmentIds.push(attachments.id)
    })
    message.stickers.forEach(async stickers => {
        if (attachmentIds == null) {
            attachmentIds = [];
        }
        attachmentIds.push(stickers.id)
    })

    sql_client.query({
        // Schema: VARCHAR(255), VARCHAR(255), VARCHAR(4000), VARCHAR(255), VARCHAR(255), VARCHAR(255), BIGINT, VARCHAR(255), VARCHAR(4000), BOOLEAN
        text: `insert into messages (authorName, authorImage, content, channel, time, uuid, guildid, userid, attachments, edited) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (uuid) DO UPDATE SET content = $3, attachments = $9, edited = $10;`,
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
            message.author.id,
            attachmentIds,
            edited
        ],
    }).then(() => {
    }).catch((e) => { });
    // Add Author to user list
    sql_client.query({
        // Note: BIGINT, VARCHAR(32), BIGINT <= Your schema
        // ALTER TABLE USERS ADD PRIMARY KEY (id);
        text: `insert into users (id, name, colour) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET id = $1, name = $2, colour = $3;`,
        values: [
            authorData.id,
            authorData.nickname ?? authorData.user.globalName ?? authorData.user.username,
            authorData.displayColor ?? 0
        ],
    }).then(() => {
        sql_client.end();
    }).catch((e) => { });

    // Add Users to list
    if (message.mentions.users.size) {
        message.mentions.users.forEach(async user => {
            let userData = (await message.guild.members.fetch(user.id))
            const sql_user_client = await createPool({
                connectionString:
                    process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
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
            }).catch(() => { });
        });
    }

    // Add Roles to list
    if (message.mentions.roles.size) {
        message.mentions.roles.forEach(async role => {
            let roleData = (await message.guild.roles.fetch(role.id))
            const sql_role_client = await createPool({
                connectionString:
                    process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
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
            }).catch(() => { });
        });
    }


    // Check if the message mentions any channels
    if (message.mentions.channels.size) {
        message.mentions.channels.forEach(async channel => {
            let channelData = (await message.guild.channels.fetch(channel.id))
            const sql_channel_client = await createPool({
                connectionString:
                    process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
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
            }).catch(() => { });
        });
    }

    // Check if the message has any stickers
    if (message.stickers.size) {
        message.stickers.forEach(async stickers => {
            if (stickers.contentType != 3) {
                const sql_attachment_client = await createPool({
                    connectionString:
                        process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
                });

                let mime = ""

                switch (stickers.format) {
                    case 1:
                        mime = "image/png"
                        break;
                    case 2:
                        mime = "image/apng"
                        break;
                    case 4:
                        mime = "image/gif"
                        break;
                }

                await sql_attachment_client.connect();
                // Add attachments to list
                sql_attachment_client.query({
                    // Note: BIGINT, VARCHAR(1000), VARCHAR(255) <= Your schema
                    // CREATE TABLE attachments(id BIGINT, name VARCHAR(255), link VARCHAR(1000), type VARCHAR(255));
                    // ALTER TABLE CHANNELS ADD PRIMARY KEY (id);
                    text: `insert into attachments (id, link, type, name) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET id = $1, link = $2, type = $3, name = $4;`,
                    values: [
                        stickers.id,
                        stickers.url,
                        mime,
                        stickers.name
                    ],
                }).then(() => {
                    sql_attachment_client.end();
                }).catch((e) => { });
            }
        });
    }

    // Check if the message has any attachments
    if (message.attachments.size) {
        message.attachments.forEach(async attachments => {

            const sql_attachment_client = await createPool({
                connectionString:
                    process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
            });

            await sql_attachment_client.connect();
            // Add attachments to list
            sql_attachment_client.query({
                // Note: BIGINT, VARCHAR(1000), VARCHAR(255) <= Your schema
                // CREATE TABLE attachments(id BIGINT, name VARCHAR(255), link VARCHAR(1000), type VARCHAR(255));
                // ALTER TABLE CHANNELS ADD PRIMARY KEY (id);
                text: `insert into attachments (id, link, type, name) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET id = $1, link = $2, type = $3, name = $4;`,
                values: [
                    attachments.id,
                    attachments.proxyURL,
                    attachments.contentType,
                    attachments.name
                ],
            }).then(() => {
                sql_attachment_client.end();
            }).catch((e) => { });
        });
    }
}

async function deleteDiscordMessage(message) {
    // Drop message from table
    const sql_client = await createPool({
        connectionString:
            process.env.POSTGRES_URL  + '?workaround=supabase-pooler.vercel',
    });

    await sql_client.connect();
    // Delete message
    sql_client.query({
        text: `delete from messages where uuid = $1;`,
        values: [
            message.id
        ],
    }).then(() => {
        sql_client.end();
    }).catch((e) => { console.log(e) });
}