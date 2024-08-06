/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import useSWR from "swr";
import { parse } from "discord-markdown-parser";
import { SingleASTNode } from "simple-markdown";

export const DiscordFeed: FC = () => {
    //@ts-ignore
    const fetcher = (...args) => fetch(...args).then((res) => res.json());
    const { data } = useSWR("/api/fetch-posts", fetcher, {
        fallbackData: [],
        refreshInterval: 5000,
    });

    const messages = data as DiscordMessageProps[];

    return (
        <div className={`w-[50vw] p-4 overflow-hidden`}>
            <h1 className={`text-white text-3xl mb-4 text-center`}>
                Live Discord Stream
            </h1>
            {messages.map((message, i) => (
                <DiscordMessage key={message.uuid} {...message} />
            ))}
            <h1 className={`text-neutral-600 text-3xl mb-4 text-center`}>
                Post more to make
                <br />
                me go away! {":)"}
            </h1>
        </div>
    );
};

export type DiscordMessageProps = {
    authorname: string;
    authorimage: string;
    content: string;
    channel: string;
    time: string;
    uuid: string;
    guildid: string;
};

export const DiscordMessage: FC<DiscordMessageProps> = ({
    authorname,
    authorimage,
    content,
    channel,
    time,
    guildid,
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
                    src={authorimage}
                    className={`inline-block
                                w-[64px]
                                h-[64px]
                                mr-4
                                object-cover
                                rounded-full`}
                    alt={`${authorname}'s Profile Picture`}
                />
                <span className={`text-white text-xl align-middle`}>
                    {authorname}
                </span>

                <div className={`inline-block ml-4 align-middle`}>
                    <span className={`text-neutral-400 text-xl`}>
                        #{channel}
                        <br />
                        {time}
                    </span>
                </div>
            </h1>
            <h1 className={`text-white text-xl break-all`}>
                <ParseDiscordMessage message={content} guildid={guildid} />
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

export type GuildUser = {
    user: DiscordUser;
    nick?: string;
    avatar?: string;
    roles: number[];
    joined_at: string;
    premium_since?: string;
    deaf: boolean;
    mute: boolean;
    flags: number;
    pending?: boolean;
    permissions: string;
    communication_disabled_until?: string;
};

export type DiscordUser = {
    id: number;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: string;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
    avatar_decoration?: string;
};

const ERROR_USER: GuildUser = {
    user: {
        id: -1,
        username: "unknownuser",
        discriminator: "0000",
        global_name: "Unknown User",
    },
    nick: "Unknown User",
    roles: [],
    joined_at: "",
    deaf: false,
    mute: false,
    flags: 0,
    permissions: "string",
};

export type GuildRole = {
    id: number;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string;
    unicode_emoji?: string;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    flags: number;
};

const ERROR_ROLE: GuildRole = {
    id: -1,
    name: "Unknown Role",
    color: 0,
    hoist: false,
    position: -1,
    permissions: "",
    managed: false,
    mentionable: true,
    flags: 0,
};

export const ParseDiscordMessage: FC<{ message: string; guildid: string }> = ({
    message,
    guildid,
}) => {
    //const parsed: SingleASTNode[] = parse(message, 'extended');
    //console.log(message)
    const parsed: SingleASTNode[] = parse(message, "extended");
    //console.log(parsed)

    let serverUsers: GuildUser[] = [];
    let serverRoles: GuildRole[] = [];

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
            users={serverUsers}
            roles={serverRoles}
        />
    ));
};

export const GenerateMessageHTML: FC<{
    node: SingleASTNode;
    users: GuildUser[];
    roles: GuildRole[];
}> = ({ node, users, roles }) => {
    let content = node.content;

    if (Array.isArray(node.content)) {
        content = node.content.map((value, index) => (
            <GenerateMessageHTML
                key={index}
                node={value}
                users={users}
                roles={roles}
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
            //const targetUser = users.find((x) => x == node.id) ?? ERROR_USER;
            //const name = (targetUser.nick ?? targetUser.user.global_name) ?? targetUser.user.username;

            const targetUserColors = DiscordColorToCssColors(0); //targetUser.roles[0] ?? 0);

            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md`}
                    style={{
                        borderColor: targetUserColors.bg,
                        backgroundColor: targetUserColors.bg,
                        color: targetUserColors.fg,
                    }}
                >
                    <strong>@Unknown User</strong>
                </span>
            );
        case "channel":
            return (
                <span
                    className={`px-[4px] rounded-md bg-blue-950 text-blue-200`}
                >
                    <strong>#Unknown Channel</strong>
                </span>
            );
        case "role":
            //const targetRole = roles.find((x) => x == node.id) ?? ERROR_ROLE;
            const targetRoleColors = DiscordColorToCssColors(0); //targetRole.color);

            return (
                <span
                    className={`border-[1px] px-[4px] rounded-md`}
                    style={{
                        borderColor: targetRoleColors.bg,
                        backgroundColor: targetRoleColors.bg,
                        color: targetRoleColors.fg,
                    }}
                >
                    <strong>@Unknown Role</strong>
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
