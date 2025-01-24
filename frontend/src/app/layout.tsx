import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {Toaster} from "@/components/ui/toaster";
import {AppQueryClientProvider} from "@/components/app-query-client-provider";

export const metadata: Metadata = {
    title: "Metar viewer",
    description: "B4CKSP4CE metar recordings viewer",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <body>
        <Toaster/>
        <AppQueryClientProvider>
            {children}
        </AppQueryClientProvider>
        </body>
        </html>
    );
}
