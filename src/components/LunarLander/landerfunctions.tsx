import { P5CanvasInstance, Sketch } from "@p5-wrapper/react";

export type CameraData = {
    x: number;
    y: number;
    s: number;
    r: number;
};

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

export type LanderCrash = {
    x: number;
    y: number;
    time: number;
}

export type MapLines = [number, number, number, number][];

export const mapWidth = 1000;
export const mapHeight = 400;

export const default_lander = (): LanderObject => {
    return {
        x: -15,
        y: 600,
        r: -Math.PI / 2,
        vx: 100,
        vy: 0,
        vr: 0.00,
        t: 0,
        a: 0,
        colour: [255, 255, 255]
    };
}

export const drawLander = (p5: P5CanvasInstance, camera: CameraData, lander: LanderObject) => {
    p5.push();
    p5.stroke(p5.color(lander.colour[0], lander.colour[1], lander.colour[2]));
    p5.strokeWeight(0.75 / camera.s)
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
    if (lander.a == 0) {
        p5.line(-2, -1.5, 0, -1.5 + ((p5.sin(p5.frameCount * 10) * 3) * lander.t) + (10 * lander.t));
        p5.line(2, -1.5, 0, -1.5 + ((p5.sin(p5.frameCount * 10) * 3) * lander.t) + (10 * lander.t));
    }
    p5.pop();
}

export const drawCrash = (p5: P5CanvasInstance, camera: CameraData, crash: LanderCrash) => {
    p5.push();
    p5.stroke(p5.color(255, 255, 255));
    p5.strokeWeight(2.5 / camera.s);
    p5.noFill();
    p5.translate(crash.x, -crash.y);

    for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
        p5.line(
            p5.sin(i + Math.PI / 8) * 0.008 * crash.time, 
            p5.cos(i + Math.PI / 8) * 0.008 * crash.time, 
            p5.sin(i) * 0.02 * crash.time, 
            p5.cos(i) * 0.02 * crash.time
        );
        p5.line(
            p5.sin(i - Math.PI / 8) * 0.008 * crash.time, 
            p5.cos(i - Math.PI / 8) * 0.008 * crash.time, 
            p5.sin(i) * 0.02 * crash.time, 
            p5.cos(i) * 0.02 * crash.time
        );
    }

    p5.pop();
}

export const drawStats = (p5: P5CanvasInstance, camera: CameraData, lander: LanderObject, game_state: number, endgame_timer: number) => {
    p5.push();
    p5.translate(-camera.x, -camera.y);
    p5.rotate(-camera.r);
    p5.scale(1 / camera.s);

    p5.textSize(40);
    p5.textAlign(p5.CENTER, p5.CENTER);
    if (lander.a == 1) {
        p5.fill(0, 255, 0);
        p5.text(`You Win!`, 0, 0);
    } else if (lander.a == 2) {
        p5.fill(255, 0, 0);
        p5.text(`You Crashed!`, 0, 0);
    } 

    p5.translate(-p5.width / 2, -p5.height / 2);
    p5.textSize(25);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.fill(255, 255, 255);

    p5.text(`Altitude: ${lander.y.toFixed(1)}`, 4, 4);
    p5.text(`Horz Speed: ${lander.vx.toFixed(1)}`, 4, 38);
    p5.text(`Vert Speed: ${lander.vy.toFixed(1)}`, 4, 72);

    let visual_timer = (endgame_timer < 0) ? 0 : (6000 - endgame_timer) / 1000;

    if (game_state == 0) {
        if (endgame_timer >= 1000) {
            p5.text(`Ending in: ${visual_timer.toFixed(1)}`, 4, 106);
        }
    } else {
        p5.text(`Starting in: ${visual_timer.toFixed(1)}`, 4, 106);
    }

    p5.pop();
}

export const drawGameState = (p5: P5CanvasInstance, camera: CameraData, game_state: number, endgame_timer: number) => {
    p5.push();
    p5.translate(-camera.x, -camera.y);
    p5.rotate(-camera.r);
    p5.scale(1 / camera.s);

    p5.translate(-p5.width / 2, -p5.height / 2 + 16);
    p5.textSize(30);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.fill(255, 255, 255);

    let visual_timer = (endgame_timer < 0) ? 0 : (6000 - endgame_timer) / 1000;

    if (game_state == 0) {
        if (endgame_timer >= 1000) {
            p5.text(`Ending in: ${visual_timer.toFixed(1)}`, 4, 4);
        }
    } else {
        p5.text(`Starting in: ${visual_timer.toFixed(1)}`, 4, 4);
    }

    p5.pop();
}

export const drawMobileControls = (p5: P5CanvasInstance, camera: CameraData) => {
    p5.push();
    p5.translate(-camera.x, -camera.y);
    p5.rotate(-camera.r);
    p5.scale(1 / camera.s);

    p5.stroke(p5.color(255, 255, 255));
    p5.strokeWeight(2.0);

    p5.translate(-p5.width / 6, p5.height / 2);
    p5.line(0, 0, 0, -100);

    p5.translate(p5.width / 3, 0);
    p5.line(0, 0, 0, -100);
    p5.pop();
}

export const checkLanderCollision = (p5: P5CanvasInstance, map_lines: MapLines, lander: LanderObject): boolean => {
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
  
export const lineline = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
    let uA = ((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
    let uB = ((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1));
    return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
}

export const computeLanderPhysics = (p5: P5CanvasInstance, lander: LanderObject): LanderObject => {
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
    
    if (lander.x > mapWidth) lander.x -= mapWidth;
    if (lander.x < 0) lander.x += mapWidth;
    
    return lander;
}

export const loadMap = (p5: P5CanvasInstance, seed: number): MapLines => {
    p5.push();

    let map_lines: MapLines = [];

    p5.randomSeed(seed);

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

    return map_lines;
}

export const drawLoadedMap = (p5: P5CanvasInstance, map_lines: MapLines, camera: CameraData, offset: number) => {
    p5.push();
    
    p5.stroke(p5.color(255,255,255));
    p5.strokeWeight(2 / camera.s);

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

export const camera2d = (p5: P5CanvasInstance, x: number, y: number, s: number, r: number): CameraData => {
    p5.translate(p5.width / 2, p5.height / 2);
    p5.scale(s);
    p5.rotate(r);
    p5.translate(x, y);

    return {
        x,
        y,
        s,
        r,
    }
}