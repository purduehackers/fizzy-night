import Head from "next/head";
import { Suspense } from "react";
import {
    DoorbellContext,
    DoorbellButton,
} from "../components/doorbell/doorbell";
import { Layout } from "antd";
import styles from "@/styles/doorbell.module.css";

export default function Page() {
    return (
        <Layout className={`${styles.mainLayout}`}>
            <Layout.Content>
                <DoorbellContext>
                    <DoorbellButton />
                </DoorbellContext>
            </Layout.Content>
        </Layout>
    );
}
