import "@/styles/global.css";
import themeConfig from "@/theme/theme";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import Head from "next/head";
import { FC } from "react";

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
            <Head>
                <title>Hero Screen</title>
                <meta
                    name="description"
                    content="Purdue Hack Club's Hero Screen"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <ConfigProvider theme={themeConfig}>
                <Component {...pageProps} />
            </ConfigProvider>
        </>
    );
};

export default App;
