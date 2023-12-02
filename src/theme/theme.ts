import type { ThemeConfig } from "antd";
import { theme } from "antd";

import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/400-italic.css";

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
