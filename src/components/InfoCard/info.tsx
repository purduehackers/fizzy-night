/* eslint-disable @next/next/no-img-element */
import { FC } from "react";

export const Info: FC<{
    title: string;
    tagline: string;
    taglineColour: string;
    version: string;
}> = ({ title, tagline, version, taglineColour }) => {
    return (
        <div className={`h-full flex flex-row`}>
            <div className={`mb-8 mx-4`}>
                <img
                    className={`w-[108px] h-[108px] block`}
                    src="ph-logo-cropped.png"
                    alt="Purdue Hackers Logo"
                />
            </div>
            <div className={`flex flex-col mr-4`}>
                <h1 className={`mb-2 text-white text-4xl font-bold italic`}>
                    {title}
                </h1>
                <h1 className={`mb-2 text-white text-3xl italic`}>{version}</h1>
                <div
                    className={`text-sm
                                border-[1px]
                                rounded-md 
                                ${`border-${taglineColour}-400`}
                                ${`bg-${taglineColour}-950`}
                                ${`text-${taglineColour}-400`}
                                mr-auto
                                px-2
                                text-center`}
                >
                    {tagline}
                </div>
            </div>
        </div>
    );
};
