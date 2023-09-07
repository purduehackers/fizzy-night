// Thank you, MatthewStanciu <3

const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

export const getSpotifyAccessToken = async () =>
    await fetch(`https://accounts.spotify.com/api/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: process.env.REFRESH_TOKEN as string,
        }),
    }).then((r) => r.json());
