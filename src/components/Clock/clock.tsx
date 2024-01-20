import { FC, useEffect, useState } from "react";
import { useLightningTimeClock } from "@purduehackers/time/react";
import dynamic from "next/dynamic";

export type ClockProps = {
    confettiCallback: () => void;
};

const midnightWarmupTime = "f~f~e|b";
const midnight = "0~0~0";
const midnightCooldownTime = "0~0~0|5";

const midnightPartyStates = [
    "bottom-0",
    "bottom-1/2 translate-y-1/2 scale-[2.5]"
]

export const Clock: FC<ClockProps> = ({ confettiCallback }) => {
    const { lightningTimeClock, timeColors, normalTimeClock } =
        useLightningTimeClock();

    const [startMidnightParty, setStartMidnightParty] = useState(false);
    const [didWeParty, setDidWeParty] = useState(false);

    useEffect(() => {
        if (lightningTimeClock == midnightWarmupTime) {
            setStartMidnightParty(true);
        } else if (lightningTimeClock == midnight && !didWeParty) {
            confettiCallback();
            setDidWeParty(true);
        } else if (lightningTimeClock == midnightCooldownTime) {
            setStartMidnightParty(false);
            setDidWeParty(false);
        }
    }, [lightningTimeClock, confettiCallback, setStartMidnightParty, didWeParty]);

    return (
        <div
            className={`fixed
                        mx-4
                        h-[140px]
                        z-10
                        -translate-x-1/2
                        left-1/2
                        transition-all
                        duration-[8s]
                        ${midnightPartyStates[startMidnightParty ? 1 : 0]}`}
        >
            <div
                className={`w-full h-full rounded-[24px] p-[5px]`}
                style={{
                    background: `linear-gradient(120deg, ${timeColors.boltColor} 0%, ${timeColors.zapColor} 50%, ${timeColors.sparkColor} 100%)`,
                }}
            >
                <div className={`w-full h-full rounded-[19px] bg-black flex flex-col text-center py-2 px-8`}>
                    <h1 className={`my-auto text-6xl font-bold italic text-ph-yellow`}>
                        {lightningTimeClock}
                    </h1>
                    <h1 className={`my-auto text-white text-xl font-bold italic`}>
                        ({normalTimeClock})
                    </h1>
                </div>
            </div>
        </div>
    );
};

// sadly page loading requires that we disable SSR for this element or Next gets sad
export const ClockNoSSR = dynamic(() => Promise.resolve(Clock), { ssr: false })