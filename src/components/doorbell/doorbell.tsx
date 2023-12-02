import { Button, Modal, Spin, Typography, notification } from "antd";
import {
    RoomProvider,
    useRoom,
    useStorage,
    useMutation,
} from "../../../liveblocks.config";
import { useEffect, type PropsWithChildren, FC } from "react";
import useSound from "use-sound";
import styles from "@/styles/doorbell.module.css";
import { LoadingOutlined } from "@ant-design/icons";

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
    }, [ringing]);

    const connection = room.getConnectionState();
    const statusText = ["connecting", "authenticating"].includes(connection)
        ? "Wiring up…"
        : connection === "open"
        ? ringing
            ? "Ringing…"
            : "Ring the doorbell"
        : "Bzzt! Error.";

    return (
        <div className={`${styles.doorbellContainer}`} suppressHydrationWarning>
            <Button
                className={`${styles.doorbellButton}`}
                type={!!ringing ? "primary" : undefined}
                shape="circle"
                onClick={ringTheBell}
                disabled={connection !== "open"}
                loading={connection !== "open"}
                icon={<>🔔</>}
            />

            <Typography.Title level={3} className={`${styles.doorbellText}`}>
                {statusText}
                {["failed", "unavailable", "closed"].includes(connection) && (
                    <>
                        <br />
                        <a href="mailto:mstanciu@purdue.edu">
                            <strong>Email Matthew</strong> to let you in
                        </a>
                    </>
                )}
            </Typography.Title>
        </div>
    );
}

export const DoorbellCard: FC = () => {
    const room = useRoom();
    const ringing = useStorage((root) => root.ringing);
    const [play] = useSound("/doorbell.mp3", { volume: 0.85 });

    useEffect(() => {
        if (ringing) {
            play();
        }
    }, [ringing]);

    const dismissRing = useMutation(({ storage }) => {
        storage.set("ringing", false);
    }, []);

    const connection = room.getConnectionState();
    const connectionLabel = ["connecting", "authenticating"].includes(
        connection
    )
        ? "Wiring up…"
        : connection === "open"
        ? "Connected"
        : "Bzzt! Error.";

    const notificationType = ["connecting", "authenticating"].includes(
        connection
    )
        ? "info"
        : connection === "open"
        ? "success"
        : "error";

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        api.open({
            key: "doorbell-notification",
            message: "Doorbell",
            type: notificationType,
            duration: notificationType == 'error' ? 0 : 4.5,
            description: connectionLabel,
            icon: notificationType == 'info' ? (<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />) : undefined
        });
    }, [connectionLabel, notificationType]);

    return (
        <>
            {contextHolder}
            <Modal
                title="Ring Ring,"
                centered
                footer={[
                    <Button key="ok" type="primary" onClick={dismissRing}>
                        OK
                    </Button>,
                ]}
                closable={false}
                maskStyle={{
                    backgroundColor: "#fbcc3866",
                }}
                open={!!ringing}
            >
                <Typography.Title
                    level={2}
                    className={`${styles.doorbellText}`}
                >
                    {`Someone's at the Door!`}
                </Typography.Title>
            </Modal>
        </>
    );
}

export const DoorbellContext: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <RoomProvider
            id="doorbell"
            initialPresence={{}}
            initialStorage={{ ringing: false }}
        >
            {typeof window === "undefined" ? null : children}
        </RoomProvider>
    );
}
