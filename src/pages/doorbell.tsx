import { DoorbellButton } from "@/components/Doorbell/doorbell";
import { DoorbellProvider } from "@/components/Doorbell/doorbellContext";
import { FC } from "react";

const DoorbellPage: FC = () => {
    return (
        <main>
            <DoorbellProvider>
                <DoorbellButton />
            </DoorbellProvider>
        </main>
    );
};

export default DoorbellPage;
