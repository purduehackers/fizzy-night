import { Col, Typography } from "antd";
import { FC, useEffect, useState } from "react";
import styles from "@/styles/index.module.css";
import useSound from "use-sound";
import { useLightningTimeClock } from "@purduehackers/time/react";

export type FooterProps = {
    confettiCallback: () => void;
};

const midnightWarmupTime = "0~4~0|0";
const midnight = "0~4~1|0";
const midnightCooldownTime = "0~4~1|5";

export const Clock: FC<FooterProps> = ({ confettiCallback }) => {
    const { lightningTimeClock, timeColors, normalTimeClock } =
        useLightningTimeClock();

    const [startMidnightParty, setStartMidnightParty] = useState(false);

    const [play] = useSound("/party-horn.mp3");

    useEffect(() => {
        if (lightningTimeClock == midnightWarmupTime) {
            setStartMidnightParty(true);
        } else if (lightningTimeClock == midnight) {
            confettiCallback();
            play();
        } else if (lightningTimeClock == midnightCooldownTime) {
            setStartMidnightParty(false);
        }
    }, [lightningTimeClock, confettiCallback, play]);

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
                    background: `linear-gradient(120deg, ${timeColors.boltColor} 0%, ${timeColors.zapColor} 50%, ${timeColors.sparkColor} 100%)`,
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
                {lightningTimeClock}
            </Typography.Title>
            <Typography.Title
                style={{
                    marginTop: 6,
                    marginBottom: 0,
                }}
                italic
                level={3}
            >
                ({normalTimeClock})
            </Typography.Title>
        </Col>
    );
};
