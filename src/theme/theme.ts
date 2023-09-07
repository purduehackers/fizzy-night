import type { ThemeConfig } from "antd";
import { theme } from "antd";
import { Space_Mono } from "next/font/google";

const space_mono = Space_Mono({
    weight: "400",
    subsets: ["latin"],
    style: "italic",
});

const themeConfig: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: "#fbcc38",
        colorInfo: "#fbcc38",
        fontFamily: "Space Mono",
        fontFamilyCode: "Space Mono",
    },
};

export default themeConfig;
