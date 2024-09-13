import { FC, useEffect } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import useSound from "use-sound";

export const ConfettiCannon: FC<{
    shootConfetti: boolean;
}> = ({ shootConfetti }) => {
    const [play] = useSound("/party-horn.mp3");

    useEffect(() => {
        if (shootConfetti) play();
    }, [shootConfetti, play]);

    return (
        <>
            <ReactCanvasConfetti
                className={`fixed top-0 left-0 w-full h-full z-20`}
                fire={shootConfetti}
                reset={false}
                particleCount={1000}
                spread={360}
                ticks={1000}
            />
        </>
    );
};
