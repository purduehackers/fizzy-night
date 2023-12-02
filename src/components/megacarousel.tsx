import { Avatar, Card, Col, Row, Typography } from "antd";
import { FC } from "react";

export type MegaCarouselProps = {
    rootClassName: string;
};

export const MegaCarousel: FC<MegaCarouselProps> = ({ rootClassName }) => {
    return (<div className={rootClassName}>
        <MegaCard
            image="https://media.gcflearnfree.org/ctassets/topics/246/share_flower_fullsize.jpg"
            authorName="FizzyApple12"
            authorImage="https://wallpapers.com/images/hd/cool-profile-picture-1ecoo30f26bkr14o.jpg"
            title="Aute irure sit commodo velit cupidatat veniam reprehenderit."
            content="Consequat esse exercitation ut incididunt amet nostrud. Consequat reprehenderit id nulla qui ipsum proident sunt nulla duis et aliquip proident tempor velit. Tempor nisi eu laboris occaecat reprehenderit cupidatat in dolore pariatur eiusmod nostrud."
        />
        <MegaCard
            image="https://media.gcflearnfree.org/ctassets/topics/246/share_flower_fullsize.jpg"
            authorName="FizzyApple12"
            authorImage="https://wallpapers.com/images/hd/cool-profile-picture-1ecoo30f26bkr14o.jpg"
            title="Aute irure sit commodo velit cupidatat veniam reprehenderit."
            content="Consequat esse exercitation ut incididunt amet nostrud. Consequat reprehenderit id nulla qui ipsum proident sunt nulla duis et aliquip proident tempor velit. Tempor nisi eu laboris occaecat reprehenderit cupidatat in dolore pariatur eiusmod nostrud."
        />
    </div>);
};

export type MegaCardProps = {
    image: string;
    authorName: string;
    authorImage: string;
    title: string;
    content: string;
};

export const MegaCard: FC<MegaCardProps> = ({ image, authorName, authorImage, title, content }) => {
    return (
        <Card style={{
            height: 'calc(50dvh - 102px)',
            marginTop: 16,
            display: 'inline-block'
        }} bodyStyle={{ padding: 0 }}>
            <Row>
                <Col>
                    <Typography.Title level={2} style={{
                        marginLeft: 24.9,
                        marginRight: 24.9
                    }}>
                        <Avatar src={authorImage} size={64} /> {authorName}
                    </Typography.Title>
                    <img
                        alt="example"
                        src={image}
                        style={{
                            borderRadius: 8,
                            height: 'calc(50dvh - 205.9px)',
                            width: 'auto',
                            objectFit: 'cover',
                            marginRight: 24.9,
                        }}
                    />
                </Col>
                <Col span={12}>
                    <Typography.Title level={3}>
                        {title}
                    </Typography.Title>
                    <Typography.Title level={4}>
                        {content}
                    </Typography.Title>
                </Col>
            </Row>
        </Card>
    );
};