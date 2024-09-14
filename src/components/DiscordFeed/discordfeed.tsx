/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import useSWR from "swr";
import { parse } from "discord-markdown-parser";
import { SingleASTNode } from "simple-markdown";

export type Message = {
    authorname: string;
    authorimage: string;
    content: string;
    channel: string;
    time: string;
    uuid: string;
    guildid: string;
};
export type IdNameColour = {
    id: number;
    name: string;
    colour: number;
};

export const DiscordFeed: FC = () => {
    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then((res) => res.json());
    const { data: messageData } = useSWR("/api/fetch-posts", fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });
    const { data: userData } = useSWR("/api/fetch-users", fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });
    const { data: roleData } = useSWR("/api/fetch-roles", fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });
    const { data: channelData } = useSWR("/api/fetch-channels", fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });

    const messages = messageData as Message[];

    return (
        <div className={`w-[50vw] p-4 overflow-hidden`}>
            <h1 className={`text-white text-3xl mb-4 text-center`}>
                Live Discord Stream
            </h1>
            {messages.map((message, i) => (
                <DiscordMessage key={message.uuid} message={message} userData={userData ?? []} roleData={roleData ?? []} channelData={channelData ?? []} />
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
    userData: IdNameColour[];
    roleData: IdNameColour[];
    channelData: IdNameColour[];
}> = ({
    message,
    userData,
    roleData,
    channelData
}) => {
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
                <span className={`text-white text-xl align-middle`}>
                    {message.authorname}
                </span>

                <div className={`inline-block ml-4 align-middle`}>
                    <span className={`text-neutral-400 text-xl`}>
                        #{message.channel}
                        <br />
                        {message.time}
                    </span>
                </div>
            </h1>
            <h1 className={`text-white text-xl break-all`}>
                <ParseDiscordMessage message={message.content} guildid={message.guildid} userData={userData} roleData={roleData} channelData={channelData} />
            </h1>
        </div>
    );
};

// export const ParseDiscordMessage: FC<{message: string}> = ({ message }) => {
//     let parsingString: string = message;

//     let messageParts: JSX.Element[] = [];
//     let nextTextPart: string = "";

//     let keyIndex = 0;

//     let pushLastTextPart = () => {
//         if (nextTextPart == "")
//             return;

//         messageParts.push(
//             <span key={keyIndex}>{nextTextPart}</span>
//         )

//         keyIndex++;
//         nextTextPart = "";
//     }

//     while (parsingString.length > 0) {
//         if (parsingString.match(/^(<:\w+:)(\d*)(>)/g)) { // emoji detected!!!
//             pushLastTextPart();

//             let emojiMatch = Array.from(parsingString.matchAll(/^<:\w*:(\d*)>/g), m => m[1]);
//             messageParts.push(
//                 <img key={keyIndex} width="28px" height="28px" className="inline-block" src={`https://cdn.discordapp.com/emojis/${emojiMatch[0]}.webp?size=128&quality=lossless`} alt={`Discord Emoji ${emojiMatch[0]}`}/>
//             )
//             keyIndex++;
//             parsingString = parsingString.replace(/^<:\w*:(\d*)>/g, "");
//         } else if (parsingString.match(/^(<a:\w+:)(\d*)(>)/g)) { // animated emoji detected!!!
//             pushLastTextPart();

//             let animatedEmojiMatch = Array.from(parsingString.matchAll(/^<a:\w*:(\d*)>/g), m => m[1]);
//             messageParts.push(
//                 <img key={keyIndex} width="28px" height="28px" className="inline-block" src={`https://cdn.discordapp.com/emojis/${animatedEmojiMatch[0]}.gif?size=128&quality=lossless`} alt={`Discord Emoji ${animatedEmojiMatch[0]}`}/>
//             )
//             keyIndex++;
//             parsingString = parsingString.replace(/^<a:\w*:(\d*)>/g, "");
//         } else {
//             nextTextPart += parsingString[0];
//             parsingString = parsingString.slice(1);
//         }
//     }
//     pushLastTextPart();

//     return messageParts;
// }

export type MentionList = [
    name: string,
    color: string
];

const ERROR_USER: IdNameColour = {
    id: 0,
    name: "Unknown User",
    colour: 0
};

const ERROR_CHANNEL: IdNameColour = {
    id: 0,
    name: "Unknown Chanel",
    colour: 0
}

const ERROR_ROLE: IdNameColour = {
    id: 0,
    name: "Unknown Role",
    colour: 0,
};

export const ParseDiscordMessage: FC<{ 
    message: string;
    guildid: string;
    userData: IdNameColour[];
    roleData: IdNameColour[];
    channelData: IdNameColour[];
}> = ({
    message,
    guildid,
    userData,
    roleData,
    channelData
}) => {
    //const parsed: SingleASTNode[] = parse(message, 'extended');
    //console.log(message)
    const parsed: SingleASTNode[] = parse(message, "extended");
    //console.log(parsed)

    if (guildid) {
        // fuck you CORS
        // const usersResponse = await fetch(`http://discord.com/api/guilds/${guildid}/members`, {
        //     method: "GET",
        //     headers: {
        //         Authorization: "Bot ****",
        //         "Access-Control-Allow-Origin": "*"
        //     },
        //     mode: "cors",
        //     cache: "no-cache",
        //     credentials: "same-origin",
        //     redirect: "follow",
        //     referrerPolicy: "no-referrer",
        // });
        // serverUsers = await usersResponse.json() as GuildUser[];
        // console.log(serverUsers)
        // const rolesResponse = await fetch(`http://discord.com/api/guilds/${guildid}/roles`, {
        //     method: "GET",
        //     headers: {
        //         Authorization: "Bot ****",
        //         "Access-Control-Allow-Origin": "*"
        //     },
        //     mode: "cors",
        //     cache: "no-cache",
        //     credentials: "same-origin",
        //     redirect: "follow",
        //     referrerPolicy: "no-referrer",
        // });
        // serverRoles = await rolesResponse.json() as GuildRole[];
        // console.log(serverRoles)
        //get all users and roles from the server
    }

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

export const GenerateMessageHTML: FC<{
    node: SingleASTNode;
    userData: IdNameColour[];
    roleData: IdNameColour[];
    channelData: IdNameColour[];
}> = ({ node, userData, roleData, channelData }) => {
    let content = node.content;

    if (Array.isArray(node.content)) {
        content = node.content.map((value, index) => (
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
            return <a className={`text-sky-500 `}>{content}</a>;
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
            const targetUserColours = DiscordColorToCssColors(targetUser.colour ?? 0);

            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md`}
                    style={{
                        borderColor: targetUserColours.bg,
                        backgroundColor: targetUserColours.bg,
                        color: targetUserColours.fg,
                    }}
                >
                    <strong>@{targetUser.name}</strong>
                </span>
            );
        case "channel":
            const targetChannel = channelData.find((x) => x.id == node.id) ?? ERROR_CHANNEL;
            const targetChannelColours = DiscordColorToCssColors(targetChannel.colour ?? 0);

            return (
                <span
                    className={`px-[4px] rounded-md bg-blue-950 text-blue-200`}
                    style={{
                        borderColor: targetChannelColours.bg,
                        backgroundColor: targetChannelColours.bg,
                        color: targetChannelColours.fg,
                    }}
                >
                    <strong>#{targetChannel.name}</strong>
                </span>
            );
        case "role":
            const targetRole = roleData.find((x) => x.id == node.id) ?? ERROR_ROLE;
            const targetRoleColours = DiscordColorToCssColors(targetRole.colour ?? 0);

            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md`}
                    style={{
                        borderColor: targetRoleColours.bg,
                        backgroundColor: targetRoleColours.bg,
                        color: targetRoleColours.fg,
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
    color: number
): { bg: string; fg: string } => {
    // console.log(color);

    if (color == 0) {
        return {
            bg: "#172554",
            fg: "#bfdbfe",
        };
    }

    // TODO: Implement proper color parsing
    return {
        bg: "#172554",
        fg: "#bfdbfe",
    };
};
