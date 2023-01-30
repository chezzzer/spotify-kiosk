import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { KeyboardEventHandler, useState } from "react";
import Image from "next/image";
import { Track } from "spotify-types";

export default function Home() {
    const [results, setResults] = useState([] as Track[]);

    const controller = new AbortController();
    const signal = controller.signal;

    const handleSearch = async (_: any) => {
        try {
            const search = document.querySelector(
                "[name=search]"
            ) as HTMLInputElement;

            if (!search.value) {
                setResults([]);
                controller.abort();
                return;
            }

            const list = await fetch("/api/search", {
                method: "POST",
                body: JSON.stringify({ search: search.value }),
                headers: {
                    "content-type": "application/json",
                },
                signal,
            });

            const json = await list.json();

            setResults(json as any);
        } catch (_) {}
    };

    const queueSong = async (event: any) => {
        const e = event.currentTarget as HTMLLinkElement;

        try {
            await fetch("/api/queue", {
                method: "POST",
                body: JSON.stringify({ uri: e.dataset.uri }),
                headers: {
                    "content-type": "application/json",
                },
            });
        } catch (_) {
            console.log("error");
            e.classList.add("error");
        }
        e.classList.add("success");
    };

    return (
        <>
            <Head>
                <title>Spotify Kiosk</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <form
                    className={styles.search}
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        onInput={handleSearch}
                        type="text"
                        name="search"
                        placeholder="Search for a song..."
                    />
                </form>
                <div className={styles.results}>
                    {results.map((result: Track) => {
                        return (
                            <div
                                key={result.id}
                                onClick={queueSong}
                                data-uri={result.uri}
                                className={styles.track}
                            >
                                <div className={styles.image}>
                                    <Image
                                        alt={result.name}
                                        width={75}
                                        height={75}
                                        src={result.album.images[0].url}
                                    />
                                </div>
                                <div className={styles.info}>
                                    <h3>{result.name}</h3>
                                    <h5>
                                        {result.artists
                                            .map((a) => a.name)
                                            .join(", ")}
                                    </h5>
                                </div>
                                <div className={styles.add}>add</div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
}
