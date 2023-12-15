import {
    DoorbellButton,
    DoorbellContext,
} from "@/components/Doorbell/doorbell";
import { FC } from "react";

const DoorbellPage: FC = () => {
    return (
        <main>
            <DoorbellContext>
                <DoorbellButton />
            </DoorbellContext>
        </main>
    );
};

export default DoorbellPage;
