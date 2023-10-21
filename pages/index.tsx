import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Track } from "spotify-types";

export default function Home() {
    const [results, setResults] = useState([] as Track[]);
    const [state, setState] = useState<Track>();
    const [queue, setQueue] = useState<Track[]>([]);

    const controller = new AbortController();
    const signal = controller.signal;

    let searchIdleTimeout: any = null;

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
                body: JSON.stringify({
                    search: search.value,
                }),
                headers: {
                    "content-type": "application/json",
                },
                signal,
            });

            const json = await list.json();

            setResults(json as any);

            clearTimeout(searchIdleTimeout);

            searchIdleTimeout = setTimeout(() => {
                clearSearch();
            }, 60 * 1000);
        } catch (_) {}
    };

    const queueSong = async (event: any) => {
        const e = event.currentTarget as HTMLLinkElement;

        if (
            e.classList.contains(styles.queueing) ||
            e.classList.contains(styles.success)
        )
            return;

        e.classList.add(styles.queueing);

        try {
            await fetch("/api/queue", {
                method: "POST",
                body: JSON.stringify({
                    uri: e.dataset.uri,
                }),
                headers: {
                    "content-type": "application/json",
                },
            });
        } catch (_) {
            console.log("error");
            e.classList.remove(styles.queueing);
            e.classList.add(styles.error);
        }
        e.classList.remove(styles.queueing);
        e.classList.add(styles.success);
    };

    const clearSearch = () => {
        const e = document.querySelector("[name=search]") as HTMLInputElement;
        e.value = "";

        setResults([]);
    };

    useEffect(() => {
        async function getState() {
            fetch("/api/queue").then(async (res) => {
                const state = await res.json();

                if (!state.currently_playing) return setState({} as Track);
                setState(state.currently_playing);

                const sample = state.queue.slice(0, 3);
                setQueue(sample);
            });
        }

        const intervalId = setInterval(() => {
            getState();
        }, 1000 * 2); // in milliseconds
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const anyNav: any = navigator;
        if ("wakeLock" in navigator) {
            anyNav["wakeLock"].request("screen");
        }
    }, []);

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
                <div className={styles.bar}>
                    <form
                        className={styles.search}
                        onSubmit={(e) => e.preventDefault()}
                        autoComplete="off"
                        autoCapitalize="off"
                    >
                        <input
                            onInput={handleSearch}
                            type="text"
                            name="search"
                            placeholder="Search for a song..."
                            autoCapitalize="off"
                            autoComplete="off"
                            autoFocus={true}
                        />
                        <div className={styles.clear} onClick={clearSearch}>
                            {results.length > 0 && (
                                <Image
                                    width={30}
                                    height={30}
                                    src="/xmark-solid.svg"
                                    alt="xmark"
                                />
                            )}
                        </div>
                    </form>
                    <div className={styles.song}>
                        <div className={styles.info}>
                            {!state && <h3>Loading...</h3>}
                            {state && (
                                <>
                                    <div className={styles.image}>
                                        <Image
                                            alt={state.name}
                                            width={50}
                                            height={50}
                                            src={state.album.images[1].url}
                                        />
                                    </div>
                                    <div className={styles.meta}>
                                        <h4>{state.name}</h4>
                                        <span>
                                            {state.artists
                                                .map((a) => a.name)
                                                .join(", ")}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles.scan}>
                        {state && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={`https://scannables.scdn.co/uri/plain/jpeg/ffffff/black/256/${state.uri}`}
                                alt="spotify scan"
                            />
                        )}
                    </div>
                </div>
                <div style={{ opacity: 0.75, marginBottom: 5 }}>UP NEXT</div>
                <div className={styles.bar}>
                    {queue.map((track, i) => (
                        <div className={styles.song}>
                            <div className={styles.info}>
                                <div className={styles.image}>
                                    <Image
                                        alt={track.name}
                                        width={50}
                                        height={50}
                                        src={track.album.images[1].url}
                                    />
                                </div>
                                <div className={styles.meta}>
                                    <h4>
                                        {i + 1}. {track.name}
                                    </h4>
                                    <span>
                                        {track.artists
                                            .map((a) => a.name)
                                            .join(", ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {!results.length && (
                    <div className={styles.promptOuter}>
                        <div className={styles.prompt}>
                            <Image
                                alt="music note"
                                src="/music-solid.svg"
                                width={150}
                                height={150}
                            />
                            <div>
                                <h1>Music Jukebox</h1>
                                <h4>Play any song here.</h4>
                            </div>
                        </div>
                    </div>
                )}
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
                                        src={result.album.images[1].url}
                                        unoptimized={true}
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
                                <div className={styles.add}></div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
}
