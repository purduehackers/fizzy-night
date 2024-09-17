/* eslint-disable @next/next/no-img-element */
import { FC, Key } from "react";
import useSWR from "swr";
import { parse } from "discord-markdown-parser";
import { SingleASTNode } from "simple-markdown";
import { CameraOutlined, PaperClipOutlined } from "@ant-design/icons";

export type ApiResponse = {
    messages: Message;
    users: IdNameColor;
    roles: IdNameColor;
    channels: IdNameColor;
    attachments: AttachmentData;
};
export type Message = {
    authorname: string;
    authorimage: string;
    content: string;
    channel: string;
    time: string;
    uuid: string;
    guildid: string;
    userid: string;
    attachments: string;
};
export type IdNameColor = {
    id: number;
    name: string;
    colour: number;
};
export type AttachmentData = {
    id: number;
    name: string;
    link: string;
    type: string;
};

export const DiscordFeed: FC = () => {
    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then((res) => res.json());

    const { data: apiRes } = useSWR("/api/fetch-discord", fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });

    const messages = apiRes.messages as Message[];

    return (
        <div className={`w-[50vw] p-4 overflow-hidden`}>
            <h1 className={`text-white text-3xl mb-4 text-center`}>
                Live Discord Stream
            </h1>
            {messages.map((message, i) => (
                    <DiscordMessage key={message.uuid} message={message} userData={apiRes.users ?? []} roleData={apiRes.roles ?? []} channelData={apiRes.channels ?? []} attachmentData={apiRes.attachments ?? []} />
            ))}
            <h1 className={`text-neutral-600 text-3xl mb-4 text-center`}>
                Post more to make
                <br />
                me go away! {":)"}
            </h1>
        </div>
    );
};

export const DiscordMessage: FC<{
    message: Message;
    userData: IdNameColor[];
    roleData: IdNameColor[];
    channelData: IdNameColor[];
    attachmentData: AttachmentData[];
}> = ({
    message,
    userData,
    roleData,
    channelData,
    attachmentData
}) => {
    const targetUser = userData.find((x) => x.id == parseInt(message.userid)) ?? ERROR_USER;
    let targetUserColors = DiscordColorToCssColors(targetUser.colour ?? 0);

    if (targetUserColors.fg == "#bfdbfe") {
        targetUserColors = {bg: "0", fg: "0"};
    }

    return (
        <div
            className={`bg-neutral-900
                        border-neutral-700
                        border-[1px]
                        p-4
                        mb-4
                        rounded-2xl
                        transition-all
                        duration-[1s]
                        animate-[message-introduced_1s_ease-out]`}
        >
            <h1 className={`mb-4`}>
                <img
                    src={message.authorimage}
                    className={`inline-block
                                w-[64px]
                                h-[64px]
                                mr-4
                                object-cover
                                rounded-full`}
                    alt={`${message.authorname}'s Profile Picture`}
                />
                <span
                    className={`text-white text-xl align-middle`}
                    style={{
                        color: targetUserColors.fg,
                    }}
                >
                    {message.authorname}
                </span>

                <div className={`inline-block ml-4 align-middle`}>
                    <span className={`text-neutral-400 text-xl`}>
                        #{message.channel}
                        &ensp;
                        {message.time}
                    </span>
                </div>
            </h1>
            <h1 className={`text-white text-xl break-all`}>
                        <span className="inline-block">
                    {message.content ? (
                        <ParseDiscordMessage message={message.content} guildid={message.guildid} userData={userData} roleData={roleData} channelData={channelData} />
                    ) : null}
                    {message.content && message.attachments ? (
                        <span>
                            <br />
                            <br />
                        </span>
                    ) : null}
                    {message.attachments ? (
                        <ParseDiscordAttachments messageAttachments={message.attachments} attachmentData={attachmentData} />
                    ) : null}
                    </span>
                </h1>
        </div>
    );
};

export type MentionList = [
    name: string,
    color: string
];

const ERROR_USER: IdNameColor = {
    id: 0,
    name: "Unknown User",
    colour: 0
};

const ERROR_CHANNEL: IdNameColor = {
    id: 0,
    name: "Unknown Channel",
    colour: 0
}

const ERROR_ROLE: IdNameColor = {
    id: 0,
    name: "Unknown Role",
    colour: 0,
};

const ERROR_ATTACHMENT: AttachmentData = {
    id: 0,
    name: "",
    link: "",
    type: ""
};

export const ParseDiscordMessage: FC<{ 
    message: string;
    guildid: string;
    userData: IdNameColor[];
    roleData: IdNameColor[];
    channelData: IdNameColor[];
}> = ({
    message,
    guildid,
    userData,
    roleData,
    channelData
}) => {
    const parsed: SingleASTNode[] = parse(message, "extended");

    return parsed.map((value, index) => (
        <GenerateMessageHTML
            key={index}
            node={value}
            userData={userData}
            roleData={roleData}
            channelData={channelData}
        />
    ));
};

export const ParseDiscordAttachments: FC<{
    messageAttachments: string;
    attachmentData: AttachmentData[];
}> = ({
    messageAttachments,
    attachmentData
}) => {

        let attachmentList = messageAttachments.slice(1, -1).replaceAll('"', '').split(",")

        return attachmentList.map((attachmentId, index) => (
            <GenerateAttachmentHTML
                key={index}
                attachmentId={attachmentId}
                attachmentData={attachmentData}
            />
        ));
    };

export const GenerateMessageHTML: FC<{
    node: SingleASTNode;
    userData: IdNameColor[];
    roleData: IdNameColor[];
    channelData: IdNameColor[];
}> = ({ node, userData, roleData, channelData }) => {
    let content = node.content;

    if (Array.isArray(node.content)) {
        content = node.content.map((value: any, index: Key | null | undefined) => (
            <GenerateMessageHTML
                key={index}
                node={value} userData={userData} roleData={roleData} channelData={channelData}                
            />
        ));
    }

    switch (node.type) {
        case "link":
            return <a className={`text-sky-500 `}>{content}</a>;
        case "blockQuote":
            return (
                <div className={`w-full`}>
                    <div
                        className={`border-l-[4px] pl-4 px-[4px] text-neutral-50 `}
                    >
                        {content}
                    </div>
                </div>
            );
        case "codeBlock":
            return (
                <div className={`w-full`}>
                    <div
                        className={`border-[1px] px-[4px] rounded-md text-neutral-50 bg-neutral-800 border-neutral-700`}
                    >
                        {(content as string).split("\n").map((line, i) => (
                            <>
                                {line}
                                <br key={line} />
                            </>
                        ))}
                    </div>
                </div>
            );
        case "newline":
            return <br />;
        case "escape":
            return <>unimplemented markdown: escape</>;
        case "autolink":
            return <>unimplemented markdown: autolink</>;
        case "url":
            content = node.content.map((value: { content: string; }, index: Key | null | undefined) => {

                // Tenor is ***not*** supported right now, due to complexity in their service.
                // Unfortunatly that disqualifies most of the Discord GIF selector.
                if (value.content.includes("https://tenor.com/view")) {
                    return (
                        <span key={index}>
                            <PaperClipOutlined />
                            <> </>
                            <a className={`text-sky-500 `}>Tenor-GIF</a>
                        </span>
                    )
                }

                if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(value.content.replace(/\?.*/, ''))) {
                    return (
                        <span key={index}>
                            <CameraOutlined />
                            <a className={`text-sky-500 px-[4px]`}>{value.content.replace(/[^/]*\/\/(?:[^@]*@)?([^:/]+(?:\.[^:/]+)*).*/, '$1')}</a>
                            <br />
                            <GenerateAttachmentHTML
                                attachmentId={"0"}
                                attachmentData={[
                                    JSON.parse(`{ "id": "0", "name": "Linked Image", "link": "${value.content}", "type": "image/*"}`)
                                ]}
                            />
                        </span>
                    )
                }

                return <a key={index} className={`text-sky-500 `}>{content}</a>;
            })

            return <a>{content}</a>;      
        case "em":
            return <em>{content}</em>;
        case "strong":
            return <strong>{content}</strong>;
        case "underline":
            return <u>{content}</u>;
        case "strikethrough":
            return <s>{content}</s>;
        case "inlineCode":
            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md text-neutral-50 bg-neutral-800 border-neutral-700 `}
                >
                    {(content as string).split("\n").map((line, i) => (
                        <>
                            {line}
                            <br key={line} />
                        </>
                    ))}
                </span>
            );
        case "text":
            return <span>{content}</span>;
        case "emoticon":
            return <>{content}</>;
        case "br":
            return <br />;
        case "spoiler":
            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md text-transparent bg-neutral-800 border-neutral-700`}
                >
                    <strong>{content}</strong>
                </span>
            );
        case "user":
            const targetUser = userData.find((x) => x.id == node.id) ?? ERROR_USER;
            const targetUserColors = DiscordColorToCssColors(targetUser.colour ?? 0);

            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md`}
                    style={{
                        borderColor: targetUserColors.bg,
                        backgroundColor: targetUserColors.bg,
                        color: targetUserColors.fg,
                    }}
                >
                    <strong>@{targetUser.name}</strong>
                </span>
            );
        case "channel":
            const targetChannel = channelData.find((x) => x.id == node.id) ?? ERROR_CHANNEL;
            const targetChannelColors = DiscordColorToCssColors(targetChannel.colour ?? 0);

            return (
                <span
                    className={`px-[4px] rounded-md bg-blue-950 text-blue-200`}
                    style={{
                        borderColor: targetChannelColors.bg,
                        backgroundColor: targetChannelColors.bg,
                        color: targetChannelColors.fg,
                    }}
                >
                    <strong>#{targetChannel.name}</strong>
                </span>
            );
        case "role":
            const targetRole = roleData.find((x) => x.id == node.id) ?? ERROR_ROLE;
            const targetRoleColors = DiscordColorToCssColors(targetRole.colour ?? 0);

            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md`}
                    style={{
                        borderColor: targetRoleColors.bg,
                        backgroundColor: targetRoleColors.bg,
                        color: targetRoleColors.fg,
                    }}
                >
                    <strong>@{targetRole.name}</strong>
                </span>
            );
        case "emoji":
            return (
                <img
                    width="28px"
                    height="28px"
                    className="inline-block"
                    src={`https://cdn.discordapp.com/emojis/${node.id}.${
                        node.animated ? "gif" : "webp"
                    }?size=128&quality=lossless`}
                    alt={`Discord Emoji ${node.name}`}
                />
            );
        case "everyone":
            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md border-blue-950 bg-blue-950 text-blue-200`}
                >
                    <strong>@everyone</strong>
                </span>
            );
        case "here":
            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md border-blue-950 bg-blue-950 text-blue-200`}
                >
                    <strong>@here</strong>
                </span>
            );
        case "twemoji":
            return <>{node.name}</>;
        case "timestamp":
            return (
                <GenerateTimeStampHTML
                    type={node.format}
                    date={new Date(parseInt(node.timestamp) * 1000)}
                />
            );
    }

    return <></>;
};

export const GenerateAttachmentHTML: FC<{
    attachmentId: string;
    attachmentData: AttachmentData[];
}> = ({ attachmentId, attachmentData }) => {
    const targetAttachment = attachmentData.find((x) => x.id == parseInt(attachmentId)) ?? ERROR_ATTACHMENT;

    console.log(attachmentData)

    if (targetAttachment.name != "") {
        if (targetAttachment.name == "Linked Image") {
            return (
                <span className={``}>
                    <img
                        style={{ maxWidth: 150, maxHeight: 150 }}
                        width="auto"
                        height="auto"
                        className="inline-block px-[2px] w-[auto] h-[auto]"
                        src={`${targetAttachment.link}`}
                        alt={`${targetAttachment.name}`}
                    /><></>
                </span>
            );
        } else if (targetAttachment.type.includes("image/")) {
            return (
                <span className={`px-[8px] `}>
                    <CameraOutlined />
                    <> </>
                    <img
                        style={{ maxWidth: 150, maxHeight: 150 }}
                        width="auto"
                        height="auto"
                        className="inline-block px-[2px] w-[auto] h-[auto]"
                        src={`${targetAttachment.link}`}
                        alt={`${targetAttachment.name}`}
                    /><></>
                </span>
            );
        } else {

            let attachmentName = targetAttachment.name
            if (attachmentName.length >= 15) {
                attachmentName = attachmentName.substring(0,12) + "...";
            }

            return (
                <span className={`px-[8px]`}>
                    <PaperClipOutlined />
                    <> </>
                    <a className={`text-sky-500 `} href={targetAttachment.link}>{attachmentName}</a><></>
                </span>
            );
        }
    }

    return (<></>);
};

const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const UNITS: { [key: string]: number } = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
};

var rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

var getRelativeTime = (d1: Date, d2: Date) => {
    // @ts-ignore This is okay to do but for some reason typescript doesnt like it :(
    let elapsed = d1 - d2;

    for (let unitType in UNITS) {
        if (Math.abs(elapsed) > UNITS[unitType] || unitType == "second") {
            return rtf.format(
                Math.round(elapsed / UNITS[unitType]),
                unitType as Intl.RelativeTimeFormatUnit
            );
        }
    }
};

export const GenerateTimeStampHTML: FC<{
    type: string;
    date: Date;
}> = ({ type, date }) => {
    switch (type) {
        case "F":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {`${DAYS_OF_WEEK[date.getDay()]}, ${date.getDate()} ${
                        MONTH_NAMES[date.getMonth()]
                    } ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`}
                </span>
            );
        case "f":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {`${date.getDate()} ${
                        MONTH_NAMES[date.getMonth()]
                    } ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`}
                </span>
            );
        case "D":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {`${date.getDate()} ${
                        MONTH_NAMES[date.getMonth()]
                    } ${date.getFullYear()}`}
                </span>
            );
        case "d":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {`${date.getDate()}/${
                        date.getMonth() + 1
                    }/${date.getFullYear()}`}
                </span>
            );
        case "T":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`}
                </span>
            );
        case "t":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {`${date.getHours()}:${date.getMinutes()}`}
                </span>
            );
        case "R":
            return (
                <span className={`px-[4px] rounded-md bg-neutral-800`}>
                    {getRelativeTime(date, new Date(Date.now()))}
                </span>
            );
    }

    return <></>;
};

export const DiscordColorToCssColors = (
    color: number | string
): { bg: string; fg: string } => {

    let parsedColor = 0

    if (typeof color === "string") {
        parsedColor = parseInt(color)
    } else {
        parsedColor = color
    }

    if (color == 0) {
        return {
            bg: "#172554", // Discord decided to treat not having a color differently
            fg: "#bfdbfe",
        };
    }

    // Discord uses 0.1 transparency for roles, For Example 
    // color: rgb(52, 152, 219); background-color: rgba(52, 152, 219, 0.1);
    return {
        bg: "#" + parsedColor.toString(16) + "1A",
        fg: "#" + parsedColor.toString(16),
    };
};
