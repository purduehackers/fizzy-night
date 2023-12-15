/* eslint-disable @next/next/no-img-element */
import { FC } from "react";


export const LunarLander: FC = () => {
    return (
        <div
            className={`w-[50vw] p-4`}
        >
            <div className={`h-[200px] flex flex-row justify-between`}>
                <h1 className={`text-white text-4xl self-end`}>
                    Play Lunar Lander <br/><br/>
                    purdue-hackers-dashboard.vercel<br/>.app/lunarlander
                </h1>
                <img
                    className={`w-[200px] h-[200px] block`}
                    src="lunar-lander-qr.png"
                    alt="Purdue Hackers Logo"
                />
            </div>
        </div>
    );
};