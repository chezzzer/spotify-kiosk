// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import spotify, { refreshToken } from "../../inc/spotify";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await refreshToken();

    if (req.method == "POST") {
        if (!req.body.uri)
            return res.status(400).end("Track parameter not found.");

        try {
            await spotify.addToQueue(req.body.uri as string);
            res.status(200).end();
        } catch (e) {
            console.error("Error adding song.");
            res.status(500).end("Error adding song.");
        }

        return;
    }

    if (req.method == "GET") {
        try {
            const queue = await fetch(
                "https://api.spotify.com/v1/me/player/queue",
                {
                    headers: {
                        Authorization: "Bearer " + spotify.getAccessToken(),
                    },
                }
            );

            const queueData = await queue.json();

            res.status(200).json(queueData);
        } catch (e) {
            console.error("Error getting queue.");
            res.status(500).end("Error getting queue.");
        }

        return;
    }
}
