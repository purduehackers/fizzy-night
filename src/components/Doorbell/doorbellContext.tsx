import {
    createContext,
    FC,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

export enum ConnectionState {
    Connecting,
    Connected,
    Error,
}

interface DoorbellContextInterface {
    doorbellState: boolean;
    connectionState: ConnectionState;
    setDoorbellState: (status: boolean) => void;
}

const DoorbellContext = createContext<DoorbellContextInterface | undefined>(
    undefined
);

export const useDoorbellContext = () => {};

export const DoorbellProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    const [doorbellState, setDoorbellStateInternal] = useState<boolean>(false);
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        ConnectionState.Connecting
    );

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket("wss://api.purduehackers.com/doorbell");

        ws.current.onopen = () => setConnectionState(ConnectionState.Connected);
        ws.current.onclose = () => {
            setConnectionState(ConnectionState.Connecting);

            // TODO: RECONNECT
        };
        ws.current.onerror = () => {
            setConnectionState(ConnectionState.Error);

            // TODO: RECONNECT
        };

        const wsCurrent = ws.current;

        return () => {
            wsCurrent.close();
        };
    }, []);

    useEffect(() => {
        if (!ws.current) return;

        ws.current.onmessage = (e) => {
            const newState = e.data == "true";

            if (doorbellState != newState) setDoorbellStateInternal(newState);
        };
    }, [doorbellState]);

    const setDoorbellState = (state: boolean) => {
        setDoorbellStateInternal(state);

        if (!ws.current) return;

        ws.current.send(state ? "true" : "false");
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
    (status: boolean) => void
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
