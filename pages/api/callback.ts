// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import SpotifyWebApi from "spotify-web-api-node";
const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const token = await spotify.authorizationCodeGrant(
        req.query.code as string
    );
    const { refresh_token } = token.body;
    res.end(
        "Enter this into SPOTIFY_REFRESH_TOKEN in your .env: " + refresh_token
    );
}
