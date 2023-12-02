import { Col, Typography } from "antd";
import { FC, useEffect, useState } from "react";
import styles from "@/styles/index.module.css";
import { LightningTime } from "@purduehackers/time";
import { format } from "date-fns";
import useSound from "use-sound";

export type FooterProps = {
    confettiCallback: () => void;
};

const midnightWarmupTime   = "0~4~0|0";
const midnight             = "0~4~1|0";
const midnightCooldownTime = "0~4~1|5";

export const Clock: FC<FooterProps> = ({ confettiCallback }) => {
    const [time, setTime] = useState("");
    const [lightningTime, setLightningTime] = useState("");
    const [lightningTimeColors, setLightningTimeColors] = useState<any>();

    const [startMidnightParty, setStartMidnightParty] = useState(false);
    
    const [play] = useSound("/party-horn.mp3");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();

            const lt = new LightningTime();
            const convertedTime = lt.convertToLightning(now).lightningString;
            setLightningTime(convertedTime);

            const colors = lt.getColors(convertedTime);
            setLightningTimeColors(colors);

            const formattedTime = format(now, "h:mm a");
            setTime(formattedTime);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (lightningTime == midnightWarmupTime) {
            setStartMidnightParty(true);
        } else if (lightningTime == midnight) {
            confettiCallback();
            play();
        } else if (lightningTime == midnightCooldownTime) {
            setStartMidnightParty(false);
        }
    }, [lightningTime, confettiCallback, play]);

    return (
        <Col
            flex="0 0 320px"
            className={`${styles.lightningTime} ${
                startMidnightParty
                    ? styles.lightningTimeFocus
                    : styles.lightningTimeUnfocus
            }`}
        >
            <div
                className={`${styles.lightningTimeBorderColor}`}
                style={{
                    background: `linear-gradient(120deg, ${lightningTimeColors?.boltColor} 0%, ${lightningTimeColors?.zapColor} 50%, ${lightningTimeColors?.sparkColor} 100%)`,
                }}
            />
            <div className={`${styles.lightningTimeBorderMask}`} />
            <Typography.Title
                style={{
                    marginTop: 0,
                    marginBottom: 0,
                    color: "#fbcc38",
                    fontSize: "4.8em",
                }}
                italic
            >
                {lightningTime}
            </Typography.Title>
            <Typography.Title
                style={{
                    marginTop: 6,
                    marginBottom: 0,
                }}
                italic
                level={3}
            >
                ({time})
            </Typography.Title>
        </Col>
    );
};
