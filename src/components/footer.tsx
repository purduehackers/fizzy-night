import { Col, Layout, Row, Space, Tag, Typography } from "antd";
import { FC, useEffect, useState } from "react";
import styles from "@/styles/index.module.css";
import { LightningTime } from "@purduehackers/time";
import { format } from "date-fns";
import { Spotify } from "./spotify/spotify";
import { Clock } from "./clock/clock";
import { Info } from "./info/info";
import useSWR from "swr";

export type FooterProps = {
    confettiCallback: () => void;
};

export const Footer: FC<FooterProps> = ({ confettiCallback }) => {

    return (
        <Layout.Footer className={`${styles.footer}`}>
            <Row gutter={12} wrap={false}>
                <Spotify />

                <Col flex="auto"></Col>

                <Clock confettiCallback={confettiCallback} />

                <Col flex="auto"></Col>

                <Info />
            </Row>
        </Layout.Footer>
    );
};
