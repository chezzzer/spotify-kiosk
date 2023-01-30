// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import spotify, { refreshToken } from "../../inc/spotify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await refreshToken();

    try {
        const state = await spotify.getMyCurrentPlaybackState();
        res.status(200).json(state.body);
    } catch (e) {
        console.error(e);
        res.status(500).end("Error adding song.");
    }
}
