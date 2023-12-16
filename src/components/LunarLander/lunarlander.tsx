/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import dynamic from "next/dynamic";
import { P5CanvasInstance, Sketch } from "@p5-wrapper/react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export type LanderObject = {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    vr: number;
    t: number;
    a: number;
    colour: [number, number, number];
};

export type MapData = {
    seed: number;
};

export type LunarLanderGameProps = {
    isDashboard: boolean;
};

const sketch: Sketch = (p5: P5CanvasInstance<LunarLanderGameProps>) => {
    let camera_x = 0;
    let camera_y = 0;
    let camera_s = 0;
    let camera_r = 0;

    const mapWidth = 1000;
    const mapHeight = 400;

    let isDashboard = false;

    let map_lines: [number, number, number, number][] = []

    const drawLander = (lander: LanderObject) => {
        p5.push();
        p5.stroke(p5.color(lander.colour[0], lander.colour[1], lander.colour[2]));
        p5.strokeWeight(0.75 / camera_s)
        p5.noFill();
        p5.translate(lander.x, -lander.y);
        p5.rotate(lander.r);
        p5.line(-8, 0, -5, 0);
        p5.line(5, 0, 8, 0);
        p5.line(-6.5, 0, -3.5, -4);
        p5.line(6.5, 0, 3.5, -4);
        p5.line(2, -4, 3, -1.5);
        p5.line(3, -1.5, -3, -1.5);
        p5.line(-3, -1.5, -2, -4);
        p5.quad(-4.5, -5.5, 4.5, -5.5, 4.5, -4, -4.5, -4);
        p5.line(-2, -5.5, -4, -7.5);
        p5.line(-4, -7.5, -4, -11.5);
        p5.line(-4, -11.5, -2, -13.5);
        p5.line(-2, -13.5, 2, -13.5);
        p5.line(2, -13.5, 4, -11.5);
        p5.line(4, -11.5, 4, -7.5);
        p5.line(4, -7.5, 2, -5.5);
        p5.line(-2, -1.5, 0, -1.5 + ((p5.sin(p5.frameCount * 10) * 3) * lander.t) + (10 * lander.t));
        p5.line(2, -1.5, 0, -1.5 + ((p5.sin(p5.frameCount * 10) * 3) * lander.t) + (10 * lander.t));
        p5.pop();
    }

    const drawStats = (lander: LanderObject) => {
        p5.push();
        p5.translate(-camera_x, -camera_y);
        p5.rotate(-camera_r);
        p5.scale(1 / camera_s);

        p5.textSize(50);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.translate(0, p5.height / 2);
        if (lander.a == 1) {
            p5.fill(0, 255, 0);
            p5.text(`You Win!`, 0, 0);
        } else if (lander.a == 2) {
            p5.fill(255, 0, 0);
            p5.text(`You Crashed!`, 0, 0);
        } 

        p5.translate(-p5.width / 2, -p5.height);
        p5.textSize(30);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.fill(255, 255, 255);

        p5.text(`Altitude: ${Math.round(lander.y)}`, 4, 4);
        p5.text(`Horizontal Speed: ${Math.round(lander.vx)}`, 4, 38);
        p5.text(`Vertical Speed: ${Math.round(lander.vy)}`, 4, 72);

        p5.pop();
    }

    const checkLanderCollision = (lander: LanderObject): boolean => {
        for (let i = 0; i < map_lines.length; i++) {
            if (
                lineline(
                    map_lines[i][0], map_lines[i][1], 
                    map_lines[i][2], map_lines[i][3],
                    lander.x - (8 * p5.cos(-lander.r)), -lander.y - (8 * p5.sin(lander.r)),
                    lander.x + (8 * p5.cos(-lander.r)), -lander.y + (8 * p5.sin(lander.r))
                ) ||
                lineline(
                    map_lines[i][0], map_lines[i][1], 
                    map_lines[i][2], map_lines[i][3],
                    lander.x - (8 * p5.cos(-lander.r)), -lander.y - (8 * p5.sin(lander.r)),
                    lander.x - (8 * p5.cos(-lander.r)) - (16 * p5.sin(-lander.r)), -lander.y - (8 * p5.sin(lander.r)) - (16 * p5.cos(-lander.r))
                ) ||
                lineline(
                    map_lines[i][0], map_lines[i][1], 
                    map_lines[i][2], map_lines[i][3],
                    lander.x - (8 * p5.cos(-lander.r)) - (16 * p5.sin(-lander.r)), -lander.y - (8 * p5.sin(lander.r)) - (16 * p5.cos(-lander.r)),
                    lander.x + (8 * p5.cos(-lander.r)) - (16 * p5.sin(-lander.r)), -lander.y + (8 * p5.sin(lander.r)) - (16 * p5.cos(-lander.r))
                ) ||
                lineline(
                    map_lines[i][0], map_lines[i][1], 
                    map_lines[i][2], map_lines[i][3],
                    lander.x + (8 * p5.cos(-lander.r)) - (16 * p5.sin(-lander.r)), -lander.y + (8 * p5.sin(lander.r)) - (16 * p5.cos(-lander.r)),
                    lander.x + (8 * p5.cos(-lander.r)), -lander.y + (8 * p5.sin(lander.r))
                )
            ) {
                return true;
            }
        }
        return false;
    }
      
    const lineline = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
        let uA = ((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
        return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
    }

    const computeLanderPhysics = (lander: LanderObject): LanderObject => {
        const deltaTime = p5.deltaTime / 1000;
        const thrust_power = 8;
        const gravity = 4;

        if (lander.a != 0) {
            lander.vx = 0;
            lander.vy = 0;
            lander.vr = 0;

            return lander;
        }
        

        lander.x += lander.vx * deltaTime;
        lander.y += lander.vy * deltaTime;
        lander.r += lander.vr * deltaTime;
        lander.vx += p5.sin(lander.r) * lander.t * thrust_power * deltaTime;
        lander.vy += (p5.cos(lander.r) * lander.t * thrust_power * deltaTime) - (gravity  * deltaTime);
        
        if (lander.x >= mapWidth) lander.x -= mapWidth;
        
        return lander;
    }

    const loadMap = (map: MapData) => {
        p5.push();

        map_lines = [];

        p5.randomSeed(map.seed);

        let number_landing_points = p5.floor(p5.random(5, 15));

        let landing_point_offsets = [];
        let landing_point_widths = [];
        let landing_point_heights = [];
        let intermediate_heights = [];

        let total_landing_area_width = 0;

        for (let i = 0; i <= number_landing_points; i++) {
            landing_point_offsets[i] = p5.random(10, mapWidth / number_landing_points);
            landing_point_widths[i] = p5.random(16, 48);
            landing_point_heights[i] = p5.random(0, mapHeight / 2);
            intermediate_heights[i] = p5.random(0, mapHeight);

            total_landing_area_width += landing_point_offsets[i];
        }

        const landing_area_fudge_factor = (mapWidth - total_landing_area_width) / (number_landing_points + 1);

        let landing_point_offset_accumulator = 0;

        for (let i = 0; i < number_landing_points; i++) {
            landing_point_offset_accumulator += landing_point_offsets[i] + landing_area_fudge_factor;

            map_lines.push([
                landing_point_offset_accumulator, 
                -landing_point_heights[i], 
                landing_point_offset_accumulator + landing_point_widths[i], 
                -landing_point_heights[i]
            ])
        }

        landing_point_offset_accumulator = landing_point_offsets[0] + landing_area_fudge_factor;
        let intermediate_pillar_offset = 0;

        let first_pillar_x = landing_point_offset_accumulator / 2;
        let first_pillar_y = -intermediate_heights[0]

        map_lines.push([
            first_pillar_x, 
            first_pillar_y, 
            landing_point_offset_accumulator, 
            -landing_point_heights[0]
        ])

        for (let i = 1; i < number_landing_points; i++) {
            intermediate_pillar_offset = (landing_point_offset_accumulator + landing_point_offset_accumulator + landing_point_offsets[i] + landing_area_fudge_factor) / 2;

            map_lines.push([
                landing_point_offset_accumulator + landing_point_widths[i - 1], 
                -landing_point_heights[i-1],
                intermediate_pillar_offset, 
                -intermediate_heights[i]
            ])

            landing_point_offset_accumulator += landing_point_offsets[i] + landing_area_fudge_factor

            map_lines.push([
                landing_point_offset_accumulator, 
                -landing_point_heights[i],
                intermediate_pillar_offset, 
                -intermediate_heights[i]
            ])
        }

        map_lines.push([
            landing_point_offset_accumulator + landing_point_widths[number_landing_points - 1], 
            -landing_point_heights[number_landing_points - 1],
            first_pillar_x + mapWidth, 
            first_pillar_y
        ])

        p5.pop();
    }

    const drawLoadedMap = (offset: number) => {
        p5.push();
        
        p5.stroke(p5.color(255,255,255));
        p5.strokeWeight(2 / camera_s);

        for (let i = 0; i < map_lines.length; i++) {
            p5.line(
                map_lines[i][0] + (offset * mapWidth),
                map_lines[i][1], 
                map_lines[i][2] + (offset * mapWidth), 
                map_lines[i][3]
            );
        }

        p5.pop();
    }

    const camera2d = (x: number, y: number, s: number, r: number) => {
        p5.translate(p5.width / 2, p5.height / 2);
        p5.scale(s);
        p5.rotate(r);
        p5.translate(x, y);

        camera_x = x;
        camera_y = y;
        camera_s = s;
        camera_r = r;
    }

    let p1Lander: LanderObject = {
        x: -15,
        y: 600,
        r: -p5.PI / 2,
        vx: 100,
        vy: 0,
        vr: 0.08,
        t: 1,
        a: 0,
        colour: [255, 255, 255]
    } 

    p5.updateWithProps = props => {
        isDashboard = props.isDashboard;
        console.log(isDashboard);
    }

    p5.setup = () => {
        p5.createCanvas(1200, 1000) // 600x600

        loadMap({
            seed: 1
        })
    };

    let land_stage = 0
  
    p5.draw = () => {

        p5.background(0);

        camera2d(-p1Lander.x, p1Lander.y, Math.min((p5.height / 2) / p1Lander.y, 2), 0);
        //camera2d(-p1Lander.x, p1Lander.y, 4, 0);
        //camera2d(-mapWidth / 2, mapHeight, 1, 0);

        // drawLoadedMap(-1);
        drawLoadedMap(0);
        // drawLoadedMap(1);

        if (checkLanderCollision(p1Lander) && p1Lander.a == 0) {
            if (p5.abs(p1Lander.vx) < 0.5 && p1Lander.vy > -5 && p1Lander.vy <= 0) {
                p1Lander.a = 1;
            } else {
                p1Lander.a = 2;
            }
        }
        drawLander(p1Lander);

        drawStats(p1Lander);

        computeLanderPhysics(p1Lander);

        if (land_stage == 0 && p1Lander.r > 0) {
            p1Lander.r = 0;
            p1Lander.vr = 0;
            p1Lander.t = 0.0;
            land_stage++;
        }
        if (land_stage == 1 && p1Lander.vy <= -46.35) {
            p1Lander.t = 1.0;
            land_stage++;
        }
        if (land_stage == 2 && p1Lander.vy >= 0.0) {
            p1Lander.t = 0.0;
            land_stage++;
        }
    };
  }

export const LunarLander: FC = () => {
    return (
        <NextReactP5Wrapper isDashboard={true} sketch={sketch} />
    );
};

export const LocalLunarLander: FC = () => {
    return (
        <NextReactP5Wrapper isDashboard={false} sketch={sketch} />
    );
};

// it's kinda hard to render a p5 sketch on the server side
export const LunarLanderNoSSR = dynamic(() => Promise.resolve(LunarLander), { ssr: false })
export const LocalLunarLanderNoSSR = dynamic(() => Promise.resolve(LocalLunarLander), { ssr: false })

export const DashboardLunarLander: FC = () => {
    return (
        <div className={`w-[50vw] p-4`}>
            <div className={`h-[200px] flex flex-row justify-between`}>
                <h1 className={`text-white text-4xl self-end`}>
                    Play Lunar Lander <br />
                    <br />
                    purdue-hackers-dashboard.vercel
                    <br />
                    .app/lunarlander
                </h1>
                <img
                    className={`w-[200px] h-[200px] block`}
                    src="lunar-lander-qr.png"
                    alt="Purdue Hackers Logo"
                />
            </div>
            <LunarLanderNoSSR/>
        </div>
    );
}