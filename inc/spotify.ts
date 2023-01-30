import SpotifyWebApi from "spotify-web-api-node";
import open from "open";

const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT,
});

if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    open(
        spotify.createAuthorizeURL(
            ["user-modify-playback-state", "user-read-playback-state"],
            "gj59w34tyh"
        )
    );
}

spotify.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN as string);

export default spotify;

export async function refreshToken() {
    const token = await spotify.refreshAccessToken();
    spotify.setAccessToken(token.body.access_token);
}
