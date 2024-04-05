/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import useSWR from "swr";

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
            {
                messages.map((message, i) => (
                    <DiscordMessage
                        key={message.uuid}
                        {...message}
                    />
                ))
            }
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
};

export const DiscordMessage: FC<DiscordMessageProps> = ({
    authorname,
    authorimage,
    content,
    channel,
    time,
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
                <ParseDiscordMessage message={content}/>    
            </h1>
        </div>
    );
};

export const ParseDiscordMessage: FC<{message: string}> = ({ message }) => {
    const messageParts: string[] = message.split(" ");

    return (
        messageParts.map((value, index) => {
            let emojiMatch = value.match(/(?<=<:\w+:)(\d*)(?=>)/g);
            if (emojiMatch) {
                return (
                    <span key={index}><img width="28px" height="28px" className="inline-block" src={`https://cdn.discordapp.com/emojis/${emojiMatch[0]}.webp?size=128&quality=lossless`} alt={`Discord Emoji ${value}`}/> </span>
                )
            }

            let animatedEmojiMatch = value.match(/(?<=<a:\w+:)(\d*)(?=>)/g);
            if (animatedEmojiMatch) {
                return (
                    <span key={index}><img width="28px" height="28px" className="inline-block" src={`https://cdn.discordapp.com/emojis/${animatedEmojiMatch[0]}.gif?size=128&quality=lossless`} alt={`Discord Emoji ${value}`}/> </span>
                )
            }

            return (<span key={index}>{value} </span>);
        })
    );
}