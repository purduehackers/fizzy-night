/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import dynamic from "next/dynamic";
import { P5CanvasInstance, Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import {
    CameraData,
    LanderCrash,
    LanderObject,
    MapLines,
    camera2d,
    checkLanderCollision,
    computeLanderPhysics,
    default_lander,
    drawCrash,
    drawGameState,
    drawLander,
    drawLoadedMap,
    drawMobileControls,
    drawStats,
    loadMap,
    mapWidth,
} from "./landerfunctions";
import { Socket, io } from "socket.io-client";

let all_landers: { [id: string]: LanderObject } = {};

let my_lander: LanderObject = default_lander();

const server_url = "wss://phws.fizzyapple12.com";

let socket: Socket;

let current_map_seed = 1;
let current_game_stage = 1;

let crashes: LanderCrash[] = [];

let camera_data: CameraData;

let map_lines: MapLines = [];

let endgame_timer: number = 0;

let parent_canvas;

// TODO: IMPLEMENT SHOOTING

const dashboard_sketch: Sketch = (p5: P5CanvasInstance) => {
    p5.setup = () => {
        parent_canvas = p5.createCanvas((window.innerWidth / 2) - 32, window.innerHeight - 356);

        if (socket) {
            socket.disconnect();
        }

        socket = io(server_url, { secure: true });

        socket.on("landers", (updated_landers) => {
            all_landers = updated_landers;
        });
        socket.on("pl_map_change", (seed) => {
            current_map_seed = seed;

            map_lines = loadMap(p5, current_map_seed);
        });
        socket.on("pl_game_stage", (stage) => {
            current_game_stage = stage;
        });
        socket.on("endgame_timer", (timer) => {
            endgame_timer = timer;
        });

        socket.on("pl_crash", (x, y) => {
            crashes.push({
                x,
                y,
                time: 0,
            });
        });

        map_lines = loadMap(p5, current_map_seed);
    };


    p5.windowResized = () => {
        p5.resizeCanvas((window.innerWidth / 2) - 32, window.innerHeight - 356);
    }

    p5.draw = () => {
        p5.background(0);

        camera_data = camera2d(
            p5,
            -mapWidth / 2,
            p5.height / 2,
            p5.width / mapWidth,
            0
        );

        drawLoadedMap(p5, map_lines, camera_data, -1);
        drawLoadedMap(p5, map_lines, camera_data, 0);
        drawLoadedMap(p5, map_lines, camera_data, 1);

        for (const player_id in all_landers) {
            if (!all_landers[player_id]) continue;

            if (all_landers[player_id].a != 2 || current_game_stage == 1)
                drawLander(p5, camera_data, all_landers[player_id]);
            if (current_game_stage == 0)
                all_landers[player_id] = computeLanderPhysics(
                    p5,
                    all_landers[player_id]
                );

            if (all_landers[player_id].a == 0 && current_game_stage == 0)
                endgame_timer = 0;
        }

        for (let i in crashes) {
            crashes[i].time += p5.deltaTime;

            drawCrash(p5, camera_data, crashes[i]);

            if (crashes[i].time >= 1000) {
                delete crashes[i];
            }
        }

        drawGameState(p5, camera_data, current_game_stage, endgame_timer);
    };
};

const client_sketch: Sketch = (p5: P5CanvasInstance) => {
    p5.setup = () => {
        parent_canvas = p5.createCanvas(window.innerWidth, window.innerHeight); // 600x600

        map_lines = loadMap(p5, current_map_seed);

        if (socket) {
            socket.disconnect();
        }

        socket = io(server_url, {secure:true});

        console.log("socket startup!");

        socket.on("landers", (updated_landers) => {
            all_landers = updated_landers;
        });
        socket.on("pl_map_change", (seed) => {
            current_map_seed = seed;

            map_lines = loadMap(p5, current_map_seed);
        });
        socket.on("pl_game_stage", (stage) => {
            current_game_stage = stage;
        });
        socket.on("endgame_timer", (timer) => {
            endgame_timer = timer;
        });

        socket.on("connect", () => {
            setInterval(() => {
                socket.emit(
                    "pl_lander_update",
                    my_lander.x,
                    my_lander.y,
                    my_lander.r,
                    my_lander.vx,
                    my_lander.vy,
                    my_lander.vr,
                    my_lander.t,
                    my_lander.a
                );
            }, 100);
        });

        socket.on("pl_crash", (x, y) => {
            crashes.push({
                x,
                y,
                time: 0,
            });
        });
    };

    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
    }

    p5.draw = () => {
        p5.background(0);

        if (current_game_stage == 0) {
            camera_data = camera2d(
                p5,
                -my_lander.x,
                my_lander.y,
                Math.min(p5.height / 2 / my_lander.y, 2),
                0
            );
        } else {
            my_lander = default_lander();

            if (p5.width > p5.height) {
                camera_data = camera2d(
                    p5,
                    -mapWidth / 2,
                    p5.height / 2,
                    p5.height / 2 / 600,
                    0
                );
            } else {
                camera_data = camera2d(
                    p5,
                    -mapWidth / 2,
                    p5.width / 2,
                    p5.width / 2 / 600,
                    0
                );
            }
        }

        drawLoadedMap(p5, map_lines, camera_data, -1);
        drawLoadedMap(p5, map_lines, camera_data, 0);
        drawLoadedMap(p5, map_lines, camera_data, 1);

        let final_vr = 0;

        let found_lt = false;
        let found_rt = false;
        let found_ct = false;

        for (let touch of p5.touches as any[]) {
            if (touch.x < (p5.width / 3)) found_lt = true;
            else if (touch.x < (p5.width / 2 / 3)) found_ct = true;
            else found_rt = true;
        }

        if (p5.keyIsDown(p5.LEFT_ARROW) || found_lt) {
            final_vr += -1;
        }
        
        if (p5.keyIsDown(p5.RIGHT_ARROW) || found_rt) {
            final_vr += 1;
        }

        my_lander.vr = final_vr;
        
        if (p5.keyIsDown(p5.UP_ARROW) || found_ct) {
            my_lander.t = 1;
        } else {
            my_lander.t = 0;
        }

        if (my_lander.a != 2) drawLander(p5, camera_data, my_lander);
        if (current_game_stage == 0)
            my_lander = computeLanderPhysics(p5, my_lander);

        if (
            checkLanderCollision(p5, map_lines, my_lander) &&
            my_lander.a == 0
        ) {
            if (
                p5.abs(my_lander.vx) < 1.5 &&
                my_lander.vy > -5 &&
                my_lander.vy <= 0
            ) {
                my_lander.a = 1;
            } else {
                my_lander.a = 2;

                socket.emit("pl_crash", my_lander.x, my_lander.y);
            }
        }

        if (my_lander.a == 0) {
            if (my_lander.y > 1000 || my_lander.y < -5) {
                my_lander.a = 2;

                socket.emit("pl_crash", my_lander.x, my_lander.y);
            }
        }

        for (const player_id in all_landers) {
            if (!all_landers[player_id]) continue;

            if (player_id == socket.id) continue;

            if (all_landers[player_id].a != 2)
                drawLander(p5, camera_data, all_landers[player_id]);
            if (current_game_stage == 0)
                all_landers[player_id] = computeLanderPhysics(
                    p5,
                    all_landers[player_id]
                );
        }

        for (let i in crashes) {
            crashes[i].time += p5.deltaTime;

            drawCrash(p5, camera_data, crashes[i]);

            if (crashes[i].time >= 1000) {
                delete crashes[i];
            }
        }
        
        drawStats(p5, camera_data, my_lander, current_game_stage, endgame_timer);
    };
};

export const LunarLander: FC = () => {
    return <NextReactP5Wrapper id="lunar_lander_container" sketch={dashboard_sketch} />;
};

export const LocalLunarLander: FC = () => {
    return <NextReactP5Wrapper sketch={client_sketch} />;
};

// it's kinda hard to render a p5 sketch on the server side
export const LunarLanderNoSSR = dynamic(() => Promise.resolve(LunarLander), {
    ssr: false,
});
export const LocalLunarLanderNoSSR = dynamic(
    () => Promise.resolve(LocalLunarLander),
    { ssr: false }
);

export const DashboardLunarLander: FC = () => {
    return (
        <div className={`w-[50vw] p-4`}>
            <div className={`h-[200px] flex flex-row justify-between`}>
                <h1 className={`text-white text-4xl self-end`}>
                    Play Lunar Lander <br />
                    <br />
                    fizzynight.purduehackers
                    <br />
                    .com/lunarlander
                </h1>
                <img
                    className={`w-[200px] h-[200px] block`}
                    src="lunar-lander-qr.png"
                    alt="Purdue Hackers Logo"
                />
            </div>
            <LunarLanderNoSSR />
        </div>
    );
};
