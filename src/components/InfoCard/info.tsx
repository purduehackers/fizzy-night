/* eslint-disable @next/next/no-img-element */
import { useInterval } from "@/hooks/useInterval";
import { useLightningTimeClock } from "@purduehackers/time/react";
import { FC, useEffect, useState } from "react";

export type InfoProps = {
    title: string;
    tagline: string;
    taglineColour: string;
    taglineColour2: string;
    version: string;
};

export const Info: FC<InfoProps> = ({
    title,
    tagline,
    version,
    taglineColour,
    taglineColour2,
}) => {
    const [actualTaglineColor, setActualTaglineColor] = useState(taglineColour);
    const { lightningTimeClock } = useLightningTimeClock();
    useEffect(() => {
        setActualTaglineColor(
            actualTaglineColor === taglineColour
                ? taglineColour2
                : taglineColour
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightningTimeClock]);
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
                                ${`border-${actualTaglineColor}-400`}
                                ${`bg-${actualTaglineColor}-950`}
                                ${`text-${actualTaglineColor}-400`}
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
