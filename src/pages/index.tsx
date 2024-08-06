import { DoorbellCard } from "@/components/Doorbell/doorbell";
import { FC, useState } from "react";
import { ConfettiCannon } from "@/components/ConfettiCannon/confetticannon";
import { Info } from "@/components/InfoCard/info";
import { Spotify } from "@/components/Spotify/spotify";
import { ClockNoSSR } from "@/components/Clock/clock";
import { DiscordFeed } from "@/components/DiscordFeed/discordfeed";
import { DashboardLunarLander } from "@/components/LunarLander/lunarlander";
import { DoorbellProvider } from "@/components/Doorbell/doorbellContext";

const MainPage: FC = () => {
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
                        <DiscordFeed />
                    </div>

                    <div className={`flex flex-row h-[140px] justify-between`}>
                        <Spotify />
                        <Info
                            title={"HACK NIGHT"}
                            tagline={"curtains closing!"}
                            taglineColour={"red"}
                            version={"4.7.1"}
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
