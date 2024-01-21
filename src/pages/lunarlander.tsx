import { FC, useState } from "react";
import { LocalLunarLanderNoSSR } from "@/components/LunarLander/lunarlander";

const MainPage: FC = () => {
    const [shootConfetti, setShootConfetti] = useState(false);

    const triggerConfetti = () => {
        setShootConfetti(true);

        setTimeout(() => {
            setShootConfetti(false);
        }, 1000);
    };

    return (
        <main className="overflow-hidden w-screen h-screen bg-black">
            <LocalLunarLanderNoSSR/>
        </main>
    );
};

export default MainPage;
