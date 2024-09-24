import type { AppProps } from "next/app";
import { FC } from "react";
import Head from "next/head";

import '@/styles/globals.css'
import { ConfigProvider } from "antd";
import themeConfig from "@/theme/theme";

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <div suppressHydrationWarning>
        <Head>
            <title>Hack Night</title>
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="theme-color" content="#000" />
            <meta
                name="description"
                content="The Hero Screen for Purdue Hackers' Hack Night event."
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
        </div>
    );
};

export default App;