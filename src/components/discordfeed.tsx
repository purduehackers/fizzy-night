import { Avatar, Card, Col, Row, Typography } from "antd";
import { FC } from "react";

export type DiscordFeedProps = {
    rootClassName: string;
};

export const DiscordFeed: FC<DiscordFeedProps> = ({ rootClassName }) => {
    return (
        <div className={rootClassName}>
            <Typography.Title
                level={2}
                style={{
                    marginLeft: 16,
                    marginRight: 16,
                }}
            >
                Live Discord Stream
            </Typography.Title>
            <DiscordMessage
                authorName="FizzyApple12"
                authorImage="https://wallpapers.com/images/hd/cool-profile-picture-1ecoo30f26bkr14o.jpg"
                content="Consequat esse exercitation ut incididunt amet nostrud. Consequat reprehenderit id nulla qui ipsum proident sunt nulla duis et aliquip proident tempor velit. Tempor nisi eu laboris occaecat reprehenderit cupidatat in dolore pariatur eiusmod nostrud."
            />
            <DiscordMessage
                authorName="FizzyApple12"
                authorImage="https://wallpapers.com/images/hd/cool-profile-picture-1ecoo30f26bkr14o.jpg"
                content="Consequat esse exercitation ut incididunt amet nostrud. Consequat reprehenderit id nulla qui ipsum proident sunt nulla duis et aliquip proident tempor velit. Tempor nisi eu laboris occaecat reprehenderit cupidatat in dolore pariatur eiusmod nostrud."
            />
        </div>
    );
};

export type DiscordMessageProps = {
    authorName: string;
    authorImage: string;
    content: string;
};

export const DiscordMessage: FC<DiscordMessageProps> = ({
    authorName,
    authorImage,
    content,
}) => {
    return (
        <Card
            style={{
                margin: 16,
                marginBottom: 0,
                display: "inline-block",
            }}
            bodyStyle={{ padding: 0 }}
        >
            <Typography.Title
                level={2}
                style={{
                    marginLeft: 16,
                    marginRight: 16,
                }}
            >
                <Avatar src={authorImage} size={64} /> {authorName}
            </Typography.Title>
            <Typography.Text
                style={{
                    display: "block",
                    margin: 16,
                    fontSize: 20,
                }}
            >
                {content}
            </Typography.Text>
        </Card>
    );
};
