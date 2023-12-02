/* eslint-disable @next/next/no-img-element */
import { Col, Row, Typography } from "antd";
import { FC } from "react";
import styles from "@/styles/index.module.css";
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
        <Col
            flex="0 0 440px"
            style={{
                opacity: songData.percent == -1 ? 0 : 1,
            }}
        >
            <Row wrap={false}>
                <Col flex="0 0 140px">
                    <img
                        className={`${styles.albumArt}`}
                        src={songData.image}
                        alt="Album Art"
                    />
                    <RCCircle
                        className={`${styles.songProgress}`}
                        percent={songData.percent * 100}
                        strokeWidth={3}
                        trailWidth={3}
                        strokeColor="#fbcc38"
                        trailColor="#ffffff1f"
                    />
                </Col>
                <Col
                    style={{
                        width: "300px",
                        flexShrink: "0",
                        float: "left",
                        textAlign: "right",
                    }}
                >
                    <Typography.Title
                        style={{
                            marginTop: 12,
                        }}
                        italic
                        level={4}
                    >
                        now playing:
                    </Typography.Title>
                    <Typography.Text
                        style={{
                            marginTop: 12,
                            fontSize: 20,
                        }}
                        italic
                    >
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
                    </Typography.Text>
                </Col>
            </Row>
        </Col>
    );
};
