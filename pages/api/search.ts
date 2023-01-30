// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import spotify, { refreshToken } from "../../inc/spotify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(400).end("Method not allowed");
    if (!req.body.search)
        return res.status(400).end("Search parameter not found.");

    await refreshToken();

    try {
        const results = await spotify.search(req.body.search, ["track"], {
            market: "NZ",
            limit: 20,
        });
        res.status(200).json(results.body.tracks?.items);
    } catch (e) {
        console.error(e);
        res.status(500).end("Error fetching search list.");
    }
}
