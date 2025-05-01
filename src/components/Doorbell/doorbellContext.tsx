import {
    createContext,
    FC,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export enum ConnectionState {
    Connecting,
    Connected,
    Error,
}

export type DoorbellWSMessage = {
    type: "set" | "status";
    ringing: boolean;
};

interface DoorbellContextInterface {
    doorbellState: boolean;
    connectionState: ConnectionState;
    setDoorbellState: (status: boolean) => void;
}

const DoorbellContext = createContext<DoorbellContextInterface | undefined>(
    undefined,
);

export const useDoorbellContext = () => {};

export const DoorbellProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    const [doorbellState, setDoorbellStateInternal] = useState<boolean>(false);
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        ConnectionState.Connecting,
    );

    const ws = useRef<ReconnectingWebSocket | null>(null);

    useEffect(() => {
        ws.current = new ReconnectingWebSocket("ws://localhost:3000/doorbell");

        ws.current.onopen = () => setConnectionState(ConnectionState.Connected);
        ws.current.onclose = () => {
            setConnectionState(ConnectionState.Connecting);
        };
        ws.current.onerror = () => {
            setConnectionState(ConnectionState.Error);
        };
    });

    useEffect(() => {
        if (!ws.current) return;

        ws.current.onmessage = (e) => {
            let message: DoorbellWSMessage;

            try {
                message = JSON.parse(String(e.data));
            } catch {
                console.error("Unknown data format", e.data);
                return;
            }

            if (message.type === "status") {
                setDoorbellStateInternal(message.ringing);
            }
        };
    }, [doorbellState]);

    const setDoorbellState = (state: boolean) => {
        setDoorbellStateInternal(state);

        if (!ws.current) return;

        ws.current.send(
            JSON.stringify({
                type: "set",
                ringing: state,
            }),
        );
    };

    return (
        <DoorbellContext.Provider
            value={{
                doorbellState,
                connectionState,
                setDoorbellState,
            }}
        >
            {children}
        </DoorbellContext.Provider>
    );
};

export const useDoorbell = (): [
    boolean,
    ConnectionState,
    (status: boolean) => void,
] => {
    const context = useContext(DoorbellContext);

    if (context === undefined) {
        throw new Error("useDoorbell must be used within a DoorbellProvider");
    }

    return [
        context.doorbellState,
        context.connectionState,
        context.setDoorbellState,
    ];
};
