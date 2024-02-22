import { Status } from "@liveblocks/client";
import {
    RoomProvider,
    useRoom,
    useStorage,
    useMutation,
} from "../../../liveblocks.config";
import { useEffect, type PropsWithChildren, FC, useState } from "react";
import useSound from "use-sound";
import { Button, Modal, Spin, Typography, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useInterval } from "@/hooks/useInterval";

export const DoorbellButton: FC = () => {
    const room = useRoom();
    const ringing = useStorage((root) => root.ringing);
    const [play] = useSound("/doorbell.mp3");

    const ringTheBell = useMutation(({ storage }) => {
        const newValue = !storage.get("ringing");
        storage.set("ringing", newValue);
    }, []);

    useEffect(() => {
        if (ringing) {
            play();
        }
    }, [ringing, play]);

    const connection = room.getStatus();
    const statusText =
        connection === "initial" || connection === "connecting"
            ? "Wiring up…"
            : connection === "connected"
            ? ringing
                ? "Ringing…"
                : "Ring the doorbell"
            : "Bzzt! Error.";

    return (
        <div
            className={`w-screen
                        h-screen
                        bg-black
                        text-center
                        flex
                        flex-col
                        m-auto
                        justify-center
                        items-center
                        overflow-hidden`}
        >
            <div
                className={`transition-all
                            duration-300
                            w-[50vmin]
                            h-[50vmin]
                            my-auto`}
            >
                <button
                    className={`transition-all
                                duration-300
                                w-full
                                h-full
                                ${
                                    ringing
                                        ? "bg-ph-yellow border-ph-yellow"
                                        : "bg-neutral-900"
                                }
                                border-neutral-700
                                ${
                                    connection !== "connected"
                                        ? ""
                                        : "hover:border-ph-yellow"
                                }
                                border-2
                                rounded-full
                                text-[30vmin]
                                my-auto`}
                    onClick={ringTheBell}
                    disabled={connection !== "connected" || (ringing || false)}
                >
                    <h1
                        className={`transition-all 
                                    duration-300
                                    ${
                                        connection !== "connected"
                                            ? "opacity-0"
                                            : "opacity-1"
                                    }`}
                    >
                        🔔
                    </h1>
                </button>

                <div
                    className={`animate-[doorbell-spinner_1.5s_linear_infinite]
                                transition-all
                                w-full
                                h-full
                                border-8
                                rounded-full
                                border-transparent
                                border-t-ph-yellow
                                pointer-events-none
                                ${
                                    connection !== "connected"
                                        ? "opacity-1"
                                        : "opacity-0"
                                }`}
                />
            </div>

            <h1 className={`text-white w-screen text-[6vw] mb-8`}>
                {statusText}
                {["failed", "unavailable", "closed"].includes(connection) && (
                    <>
                        <br />
                        <a href="mailto:mstanciu@purdue.edu">
                            <strong>Email Matthew</strong> to let you in
                        </a>
                    </>
                )}
            </h1>
        </div>
    );
};

export const DoorbellCard: FC = () => {
    const room = useRoom();
    const ringing = useStorage((root) => root.ringing);
    const [play] = useSound("/doorbell.mp3", { volume: 0.85 });
    
    const [ringTimeout, setRingTimeout] = useState<NodeJS.Timeout>();
    const [ringTime, setRingTime] = useState<number>(Date.now());
    const [timeRemaining, setTimeRemaining] = useState<number>(Date.now());

    const dismissRing = useMutation(({ storage }) => {
        storage.set("ringing", false);

        clearTimeout(ringTimeout);
    }, []);

    useEffect(() => {
        if (ringing) {
            play();

            setRingTime(Date.now());

            setRingTimeout(setTimeout(() => {
                dismissRing();
            }, 20000));
        } else {
            clearTimeout(ringTimeout);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ringing, play, dismissRing]); // no matter how much it tempts you, do NOT add ringTimeout as a dependency

    useInterval(() => {
        if (!ringing)
            setRingTime(Date.now());

        setTimeRemaining(20 - Math.floor((Date.now() - ringTime) / 1000))
    }, 500);

    const connection = room.getStatus();
    const connectionLabel =
        connection === "initial" || connection === "connecting"
            ? "Wiring up…"
            : connection === "connected"
            ? "Connected"
            : "Bzzt! Error.";

    const notificationType =
        connection === "initial" || connection === "connecting"
            ? "info"
            : connection === "connected"
            ? "success"
            : "error";

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        api.open({
            key: "doorbell-notification",
            message: "Doorbell",
            type: notificationType,
            duration: notificationType == "error" ? 0 : 4.5,
            description: connectionLabel,
            icon:
                notificationType == "info" ? (
                    <Spin
                        indicator={
                            <LoadingOutlined style={{ fontSize: 24 }} spin />
                        }
                    />
                ) : undefined,
        });
    }, [connectionLabel, notificationType, api]);

    return (
        <>
            {contextHolder}
            <Modal
                title="Ring Ring,"
                centered
                footer={[
                    <Button
                        className={`bg-ph-yellow text-neutral-900`}
                        key="ok" 
                        type="primary" 
                        onClick={dismissRing}
                    >
                        OK ({timeRemaining}s)
                    </Button>,
                ]}
                closable={false}
                styles={{
                    mask: {
                        backgroundColor: "#fbcc3866",
                    }
                }}
                open={!!ringing}
            >
                <Typography.Title level={2} className={`text-center`}>
                    {`Someone's at the Door!`}
                </Typography.Title>
            </Modal>
        </>
    );
};

export const DoorbellContext: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <RoomProvider
            id="doorbell"
            initialPresence={{}}
            initialStorage={{ ringing: false }}
        >
            {children}
        </RoomProvider>
    );
};
