// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import spotify, { refreshToken } from "../../inc/spotify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(400).end("Method not allowed");
    if (!req.body.uri) return res.status(400).end("Track parameter not found.");

    await refreshToken();

    try {
        await spotify.addToQueue(req.body.uri as string);
        res.status(200).end();
    } catch (e) {
        console.error(e);
        res.status(500).end("Error adding song.");
    }
}
