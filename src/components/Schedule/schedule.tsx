/* eslint-disable @next/next/no-img-element */
import { useInterval } from "@/hooks/useInterval";
import {
    FC,
    MutableRefObject,
    useEffect,
    useReducer,
    useRef,
    useState,
} from "react";

enum Day {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
}

type WeeklyDate = {
    day: Day;
    hour: number;
    minute: number;
    second: number;
};

type ScheduleEvent = {
    title: string;
    start: WeeklyDate;
    end: WeeklyDate;
};

type Schedule = ScheduleEvent[];

const HACK_NIGHT_SCHEDULE = [
    {
        title: "Hey! You're not supposed to be here!",
        start: {
            day: Day.Monday,
            hour: 0,
            minute: 0,
            second: 0,
        },
        end: {
            day: Day.Friday,
            hour: 17,
            minute: 0,
            second: 0,
        },
    },
    {
        title: "Hacking",
        start: {
            day: Day.Friday,
            hour: 20,
            minute: 0,
            second: 0,
        },
        end: {
            day: Day.Monday,
            hour: 0,
            minute: 0,
            second: 0,
        },
    },
    {
        title: "Circle: Spoken Language",
        start: {
            day: Day.Friday,
            hour: 21,
            minute: 0,
            second: 0,
        },
        end: {
            day: Day.Friday,
            hour: 21,
            minute: 59,
            second: 59,
        },
    },
    // {
    //     title: "Passport-Making Ceremony",
    //     start: {
    //         day: Day.Friday,
    //         hour: 22,
    //         minute: 0,
    //         second: 0,
    //     },
    //     end: {
    //         day: Day.Friday,
    //         hour: 22,
    //         minute: 59,
    //         second: 59,
    //     },
    // },
    {
        title: "Circle: Programming Languages",
        start: {
            day: Day.Friday,
            hour: 23,
            minute: 0,
            second: 0,
        },
        end: {
            day: Day.Friday,
            hour: 23,
            minute: 59,
            second: 38,
        },
    },
    {
        title: "Count Down!",
        start: {
            day: Day.Friday,
            hour: 23,
            minute: 59,
            second: 38,
        },
        end: {
            day: Day.Friday,
            hour: 23,
            minute: 59,
            second: 59,
        },
    },
    {
        title: "Checkpoints",
        start: {
            day: Day.Saturday,
            hour: 0,
            minute: 0,
            second: 0,
        },
        end: {
            day: Day.Saturday,
            hour: 1,
            minute: 0,
            second: 0,
        },
    },
];

const WeeklyDateToSeconds = (date: WeeklyDate) => {
    return (
        date.day * 60 * 60 * 24 +
        date.hour * 60 * 60 +
        date.minute * 60 +
        date.second
    );
};

const EventLength = (event: ScheduleEvent) => {
    if (IsEventOverflowing(event)) {
        return (
            SECONDS_PER_WEEK -
            WeeklyDateToSeconds(event.start) +
            WeeklyDateToSeconds(event.end)
        );
    } else
        return (
            WeeklyDateToSeconds(event.end) - WeeklyDateToSeconds(event.start)
        );
};

const IsEventOverflowing = (event: ScheduleEvent) => {
    return WeeklyDateToSeconds(event.start) > WeeklyDateToSeconds(event.end);
};

// This function is fucked up, it could be so much better but i'm too lazy to derive a proper algorithm
const AreEventsOverlapping = (event1: ScheduleEvent, event2: ScheduleEvent) => {
    const event1Start = WeeklyDateToSeconds(event1.start);
    const event1End = event1Start + EventLength(event1);

    const event2Start = WeeklyDateToSeconds(event2.start);
    const event2End = event2Start + EventLength(event2);

    if (event2Start > event1Start && event2Start < event1End) {
        return true;
    } else if (event1Start > event2Start && event1Start < event2End) {
        return true;
    } else if (event1End > event2Start && event1End < event2End) {
        return true;
    } else if (event2End > event1Start && event2End < event1End) {
        return true;
    }

    return false;
};

const SecondsToOffset = (
    seconds: number,
    container: MutableRefObject<HTMLDivElement | null>
) => {
    const containerHeight = container.current?.clientHeight ?? 1;

    return (seconds / SECONDS_PER_SCREEN) * containerHeight;
};

const SecondsToOffsetCenter = (
    seconds: number,
    container: MutableRefObject<HTMLDivElement | null>
) => {
    const containerHeight = container.current?.clientHeight ?? 1;

    return (
        (seconds / SECONDS_PER_SCREEN) * containerHeight - containerHeight / 2
    );
};

const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;

// 4 hours
const SECONDS_PER_SCREEN = 60 * 60 * 3;

const offsetReducer = (state: number[], action: [number, number]): number[] => {
    state[action[0]] = action[1];
    return state;
};

export const Schedule: FC = () => {
    const scheduleContainerRef = useRef<HTMLDivElement>(null);

    const [secondsOffset, setSecondsOffset] = useState<number>(0);

    useInterval(() => {
        const now = new Date(Date.now());

        setSecondsOffset(
            -SecondsToOffsetCenter(
                WeeklyDateToSeconds({
                    day: now.getDay(),
                    hour: now.getHours(),
                    minute: now.getMinutes(),
                    second: now.getSeconds(),
                }),
                // WeeklyDateToSeconds({
                //     day: Day.Friday,
                //     hour: 23,
                //     minute: 0,
                //     second: 0,
                // }),
                scheduleContainerRef
            )
        );
    }, 500);

    const [rawoffsets, updateOffsets] = useReducer<
        (state: number[], action: [number, number]) => number[]
    >(
        offsetReducer,
        HACK_NIGHT_SCHEDULE.map(() => 0)
    );

    const [offsets, setOffsets] = useState<number[]>(
        HACK_NIGHT_SCHEDULE.map(() => 0)
    );

    useEffect(() => {
        setOffsets(rawoffsets);
    }, [rawoffsets]);

    return (
        <div className="flex-grow flex flex-col justify-center">
            <h1 className={`text-white text-3xl mb-4 text-center`}>
                Hack Night Schedule
            </h1>
            <div className="flex-grow flex flex-col justify-center overflow-hidden">
                <div
                    className="relative w-full h-full overflow-hidden"
                    ref={scheduleContainerRef}
                >
                    {[-1, 0, 1].map((place) => {
                        let topOffset =
                            secondsOffset +
                            SecondsToOffset(
                                SECONDS_PER_WEEK,
                                scheduleContainerRef
                            ) *
                                place;

                        return (
                            <div
                                key={`calinstance${place}`}
                                className="absolute left-0 right-0"
                                style={{
                                    top: topOffset,
                                    height: SecondsToOffset(
                                        SECONDS_PER_WEEK,
                                        scheduleContainerRef
                                    ),
                                }}
                            >
                                {HACK_NIGHT_SCHEDULE.map((event, i) => {
                                    if (IsEventOverflowing(event)) {
                                        return (
                                            <span
                                            key={`span${i}`}
                                            >
                                                <ScheduleEventCard
                                                    key={`event${i}pt1`}
                                                    scheduleContainerRef={
                                                        scheduleContainerRef
                                                    }
                                                    event={{
                                                        ...event,
                                                        end: {
                                                            day: Day.Saturday,
                                                            hour: 24,
                                                            minute: 0,
                                                            second: 0,
                                                        },
                                                    }}
                                                    borderType={1}
                                                    currentOffset={-topOffset}
                                                    innerEventOffset={(width) =>
                                                        updateOffsets([
                                                            i,
                                                            width,
                                                        ])
                                                    }
                                                    offsets={offsets}
                                                />
                                                <ScheduleEventCard
                                                    key={`event${i}pt2`}
                                                    scheduleContainerRef={
                                                        scheduleContainerRef
                                                    }
                                                    event={{
                                                        ...event,
                                                        start: {
                                                            day: Day.Sunday,
                                                            hour: 0,
                                                            minute: 0,
                                                            second: 0,
                                                        },
                                                    }}
                                                    borderType={2}
                                                    currentOffset={-topOffset}
                                                    innerEventOffset={() => {}}
                                                    offsets={offsets}
                                                />
                                            </span>
                                        );
                                    } else {
                                        return (
                                            <ScheduleEventCard
                                                key={`event${i}`}
                                                scheduleContainerRef={
                                                    scheduleContainerRef
                                                }
                                                event={event}
                                                borderType={0}
                                                currentOffset={-topOffset}
                                                innerEventOffset={(width) =>
                                                    updateOffsets([i, width])
                                                }
                                                offsets={offsets}
                                            />
                                        );
                                    }
                                })}
                            </div>
                        );
                    })}
                    <div
                        key="indexbar"
                        className="absolute border-b-2 border-red-500 w-full top-2/4"
                    ></div>
                </div>
            </div>
        </div>
    );
};

export const ScheduleEventCard: FC<{
    scheduleContainerRef: MutableRefObject<HTMLDivElement | null>;
    event: ScheduleEvent;
    borderType: number;
    currentOffset: number;
    innerEventOffset: (width: number) => void;
    offsets: number[];
}> = ({
    scheduleContainerRef,
    event,
    borderType,
    currentOffset,
    innerEventOffset,
    offsets,
}) => {
    const [topOffset, setTopOffset] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        setTopOffset(
            SecondsToOffset(
                WeeklyDateToSeconds(event.start),
                scheduleContainerRef
            )
        );
        setHeight(
            SecondsToOffset(
                WeeklyDateToSeconds(event.end) -
                    WeeklyDateToSeconds(event.start),
                scheduleContainerRef
            )
        );
    }, [scheduleContainerRef, event]);

    const [textOffset, setTextOffset] = useState<number>(0);

    const textDiv = useRef<HTMLDivElement>(null);
    const textHeight = textDiv.current?.clientHeight ?? 1;

    useEffect(() => {
        innerEventOffset((textDiv.current?.clientWidth ?? 1) + 16);
    }, [innerEventOffset, textDiv]);

    useEffect(() => {
        setTextOffset(
            Math.min(
                Math.max(0, currentOffset - topOffset),
                topOffset + height - textHeight
            )
        );
    }, [topOffset, currentOffset, height, textHeight]);

    const [leftOffset, setLeftOffset] = useState<number>(0);

    useEffect(() => {
        setLeftOffset(
            HACK_NIGHT_SCHEDULE.filter(
                (checkEvent) => checkEvent.title !== event.title
            ).reduce((accumulator, checkEvent, i) => {
                if (
                    AreEventsOverlapping(event, checkEvent) &&
                    EventLength(event) < EventLength(checkEvent)
                ) {
                    return accumulator + offsets[i];
                } else {
                    return accumulator;
                }
            }, 0)
        );
    }, [offsets, event]);

    return (
        <div
            key={`intevent${event.title}`}
            className="absolute right-0 bg-neutral-800 bg-opacity-50 border-neutral-500 border-[1px] overflow-hidden"
            style={{
                left: leftOffset,
                top: topOffset,
                height: height,
                borderTopWidth: borderType === 2 ? 0 : 1,
                borderBottomWidth: borderType === 1 ? 0 : 1,
            }}
        >
            {borderType === 2 ? (
                <></>
            ) : (
                <div
                    key={`inteventtxt${event.title}`}
                    ref={textDiv}
                    className="absolute left-0 overflow-hidden text-neutral-50 m-2"
                    style={{
                        top: textOffset,
                    }}
                >
                    {event.title}
                </div>
            )}
        </div>
    );
};
