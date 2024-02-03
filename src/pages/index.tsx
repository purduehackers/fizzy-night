import { DoorbellCard, DoorbellContext } from "@/components/Doorbell/doorbell";
import { FC, useState } from "react";
import { ConfettiCannon } from "@/components/ConfettiCannon/confetticannon";
import { Info } from "@/components/InfoCard/info";
import { Spotify } from "@/components/Spotify/spotify";
import { ClockNoSSR } from "@/components/Clock/clock";
import { DiscordFeed } from "@/components/DiscordFeed/discordfeed";
import { DashboardLunarLander } from "@/components/LunarLander/lunarlander";

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

                    <div className={`flex flex-row  h-[140px] justify-between`}>
                        <Spotify />
                        <Info
                            title={"HACK NIGHT"}
                            tagline={"surfin"}
                            taglineColour={"blue"}
                            version={"3.15"}
                        />
                    </div>
                </div>

                <ClockNoSSR confettiCallback={triggerConfetti} />

                <ConfettiCannon shootConfetti={shootConfetti} />

                <DoorbellContext>
                    <DoorbellCard />
                </DoorbellContext>
            </div>
        </main>
    );
};

export default MainPage;
