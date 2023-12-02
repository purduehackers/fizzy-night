import styles from "@/styles/index.module.css";
import { FC, useState } from "react";
import { DiscordFeed } from "@/components/discordfeed";
import { Layout } from "antd";
import { Footer } from "@/components/footer";
import ReactCanvasConfetti from "react-canvas-confetti";
import { DoorbellCard, DoorbellContext } from "@/components/doorbell/doorbell";

const Home: FC = () => {
    const [shootConfetti, setShootConfetti] = useState(false);

    const triggerConfetti = () => {
        setShootConfetti(true);

        setTimeout(() => {
            setShootConfetti(false);
        }, 1000);
    };

    return (
        <Layout rootClassName={`${styles.mainLayout}`}>
            <Layout.Content>
                <DiscordFeed rootClassName={`${styles.megaCarousel}`} />
            </Layout.Content>

            <Footer confettiCallback={triggerConfetti} />

            <ReactCanvasConfetti
                style={{
                    position: "fixed",
                    width: "100dvw",
                    height: "100dvh",
                }}
                fire={shootConfetti}
                reset={false}
                particleCount={1000}
                spread={360}
                ticks={1000}
            />

            <DoorbellContext>
                <DoorbellCard />
            </DoorbellContext>
        </Layout>
    );
};

export default Home;
