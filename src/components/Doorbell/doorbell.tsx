import { useEffect, type PropsWithChildren, FC, useState } from "react";
import useSound from "use-sound";
import { Button, Modal, Spin, Typography, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useInterval } from "@/hooks/useInterval";
import { ConnectionState, useDoorbell } from "./doorbellContext";
import { useTimeout } from "@/hooks/useTimeout";

export const DoorbellButton: FC = () => {
    const [ringing, connectionState, setRinging] = useDoorbell();
    const [play] = useSound("/doorbell.mp3");

    const ringTheBell = () => {
        setRinging(true);
    };

    useEffect(() => {
        if (ringing) {
            play();
        }
    }, [ringing, play]);

    const statusText =
        connectionState == ConnectionState.Connecting
            ? "Wiring up…"
            : connectionState == ConnectionState.Connected
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
                                    connectionState != ConnectionState.Connected
                                        ? ""
                                        : "hover:border-ph-yellow"
                                }
                                border-2
                                rounded-full
                                text-[30vmin]
                                my-auto`}
                    onClick={ringTheBell}
                    disabled={
                        connectionState != ConnectionState.Connected ||
                        ringing ||
                        false
                    }
                >
                    <h1
                        className={`transition-all
                                    duration-300
                                    ${
                                        connectionState !=
                                        ConnectionState.Connected
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
                                    connectionState != ConnectionState.Connected
                                        ? "opacity-1"
                                        : "opacity-0"
                                }`}
                />
            </div>

            <h1 className={`text-white w-screen text-[6vw] mb-8`}>
                {statusText}
                {connectionState == ConnectionState.Error && (
                    <>
                        <br />
                        <a href="mailto:mstanciu@purdue.edu">
                            <span className="underline"><strong>Email Matthew</strong></span> to let you in
                        </a>
                        <p className="text-base">or dial 0 on the rotary phone</p>
                    </>
                )}
            </h1>
        </div>
    );
};

export const DoorbellCard: FC = () => {
    const [ringing, connectionState, setRinging] = useDoorbell();
    const [play] = useSound("/doorbell.mp3", { volume: 0.85 });

    const [ringTimeoutDuration, setRingTimeoutDuration] = useState<
        number | null
    >(null);
    const [ringTime, setRingTime] = useState<number>(Date.now());
    const [timeRemaining, setTimeRemaining] = useState<number>(Date.now());

    const dismissRing = () => {
        setRinging(false);
    };

    useTimeout(dismissRing, ringTimeoutDuration);

    useEffect(() => {
        if (ringing) {
            play();

            if (!ringTimeoutDuration) setRingTimeoutDuration(20000);
        } else {
            setRingTimeoutDuration(null);
        }
    }, [ringing, play, ringTimeoutDuration]);

    useInterval(() => {
        if (!ringing) setRingTime(Date.now());

        setTimeRemaining(20 - Math.floor((Date.now() - ringTime) / 1000));
    }, 500);

    const connectionLabel =
        connectionState == ConnectionState.Connecting
            ? "Wiring up…"
            : connectionState == ConnectionState.Connected
            ? "Connected"
            : "Bzzt! Error.";

    const notificationType =
        connectionState == ConnectionState.Connecting
            ? "info"
            : connectionState == ConnectionState.Connected
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
                    },
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
