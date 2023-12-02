/* eslint-disable @next/next/no-img-element */
import { Col, Row, Space, Tag, Typography } from "antd";
import { FC } from "react";
import styles from "@/styles/index.module.css";

export type FooterProps = {};

export const Info: FC<FooterProps> = ({}) => {
    return (
        <Col
            flex="0 0 380px"
            style={{
                paddingTop: 6,
            }}
        >
            <Row wrap={false}>
                <Col flex="0 0 120px">
                    <img
                        className={`${styles.phLogo}`}
                        src="ph-logo-cropped.png"
                        alt="Album Art"
                    />
                </Col>
                <Col
                    style={{
                        width: "280px",
                        float: "right",
                        textAlign: "left",
                    }}
                >
                    <Typography.Title
                        style={{
                            marginTop: 0,
                            marginBottom: 0,
                        }}
                        italic
                        level={1}
                    >
                        HACK NIGHT
                    </Typography.Title>
                    <Typography.Title
                        style={{
                            marginTop: 0,
                            marginBottom: 12,
                        }}
                        italic
                        level={2}
                    >
                        3.0{" "}
                    </Typography.Title>
                    <Space size={[0, 8]} wrap>
                        <Tag color="orange">now fully rotated around the Sun!</Tag>
                    </Space>
                </Col>
            </Row>
        </Col>
    );
};
