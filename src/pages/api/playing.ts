// Thank you, MatthewStanciu <3

import { NextApiRequest, NextApiResponse } from "next";
import { getSpotifyAccessToken } from '@/components/Spotify/getspotifytoken';

const playing = async (req: NextApiRequest, res: NextApiResponse) => {
    //@ts-ignore
    const { access_token } = await getSpotifyAccessToken();

    const data = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        }
    ).then((r) => (r.status !== 200 ? undefined : r.json()));

    if (!data) {
        return res.json({
            title: "Not playing",
            artist: "Not playing",
            image: "spotify-logo.png",
            percent: -1,
        });
    }
    
    const { name: title, artists } = data.item;

    let image = "unknown-album.png";
    if (data.item.album.images[0]) {
        image = data.item.album.images[0].url;
    }

    //@ts-ignore
    const _artists = artists.map(({ name }) => name);
    const artist = _artists.length > 1 ? _artists.join(", ") : _artists[0];

    const percent = data.progress_ms / data.item.duration_ms;

    return res.json({ title, artist, image, percent });
};

export default playing;