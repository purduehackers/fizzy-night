import { FC, useState } from "react";
import { get } from "@vercel/edge-config";

import { DoorbellCard } from "@/components/Doorbell/doorbell";
import { ConfettiCannon } from "@/components/ConfettiCannon/confetticannon";
import { Info } from "@/components/InfoCard/info";
import { Spotify } from "@/components/Spotify/spotify";
import { ClockNoSSR } from "@/components/Clock/clock";
import { DiscordFeed } from "@/components/DiscordFeed/discordfeed";
import { DashboardLunarLander } from "@/components/LunarLander/lunarlander";
import { DoorbellProvider } from "@/components/Doorbell/doorbellContext";
import { Schedule } from "@/components/Schedule/schedule";

export async function getServerSideProps() {
    const title = await get("dashboard_title");
    const version = await get("dashboard_version");
    const color = await get("dashboard_color");
    const tagline = await get("dashboard_tagline");

    const data = { title, version, color, tagline };

    // Pass data to the page via props
    return { props: { title, version, color, tagline } };
}

const MainPage: FC<{
    title: string;
    version: string;
    color: string;
    tagline: string;
}> = ({ title, version, color, tagline }) => {
    const [shootConfetti, setShootConfetti] = useState(false);

    const triggerConfetti = () => {
        setShootConfetti(true);

        setTimeout(() => {
            setShootConfetti(false);
        }, 1000);
    };

    return (
        <main className="overflow-hidden select-none">
            <div className={`w-screen h-screen bg-black`}>
                <div className={`w-screen h-screen flex flex-col`}>
                    <div
                        className={`flex flex-row grow justify-stretch max-h-[calc(100vh-140px)]`}
                    >
                        <DashboardLunarLander />
                        <div className="flex flex-col w-[50vw] p-4 overflow-hidden">
                            {/*<Schedule />*/}
                            {/*<div className="flex-grow flex items-center justify-center">
                                <h1
                                    className={`text-neutral-600 text-3xl mb-4 text-center`}
                                >
                                    Big things in the works, stay tuned...
                                </h1>
                            </div>*/}
                        </div>
                        <DiscordFeed />
                    </div>

                    <div className={`flex flex-row h-[140px] justify-between`}>
                        <Spotify />
                        <Info
                            title={title}
                            tagline={tagline}
                            taglineColour={color}
                            version={version}
                        />
                    </div>
                </div>

                <ClockNoSSR confettiCallback={triggerConfetti} />

                <ConfettiCannon shootConfetti={shootConfetti} />

                <DoorbellProvider>
                    <DoorbellCard />
                </DoorbellProvider>
            </div>
        </main>
    );
};

export default MainPage;
