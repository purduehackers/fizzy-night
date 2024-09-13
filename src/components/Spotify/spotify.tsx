/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import Marquee from "react-fast-marquee";
import { Circle as RCCircle } from "rc-progress";
import useSWR from "swr";

export type FooterProps = {};

export const Spotify: FC<FooterProps> = ({}) => {
    const fallbackSongData = {
        title: "Not playing",
        artist: "Not playing",
        image: "spotify-logo.png",
        percent: -1,
    };

    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then((res) => res.json());
    const { data: songData } = useSWR("/api/playing", fetcher, {
        fallbackData: fallbackSongData,
        refreshInterval: 1000,
    });

    return (
        <div className={`h-full flex flex-row opacity-0`}>
            <div className={`h-full pb-4 pl-4`}>
                <div className={`h-full p-[6px]`}>
                    <img
                        className={`block h-full rounded-full`}
                        src={songData.image}
                        alt="Album Art"
                    />
                </div>
                <RCCircle
                    className={`block h-full -translate-y-full`}
                    percent={songData.percent * 100}
                    strokeWidth={3}
                    trailWidth={3}
                    strokeColor="#fbcc38"
                    trailColor="#ffffff1f"
                />
            </div>
            <div className={`h-full pb-4 pl-4 w-[300px]`}>
                <h1 className={`mb-2 text-white text-xl font-bold italic`}>
                    Spotify:
                </h1>
                <h1 className={`mb-2 text-white text-xl italic`}>
                    {songData.title.length > 22 ? (
                        <Marquee speed={25}>
                            {songData.title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </Marquee>
                    ) : (
                        <>
                            {songData.title}
                            <br />
                        </>
                    )}
                    {songData.artist.length > 22 ? (
                        <Marquee speed={25}>
                            {songData.artist}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </Marquee>
                    ) : (
                        <>
                            {songData.artist}
                            <br />
                        </>
                    )}
                </h1>
            </div>
        </div>
    );
};