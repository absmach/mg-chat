"use client";

import {
    ThemeProvider as NextThemesProvider,
    type ThemeProviderProps,
} from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({
    children,
    ...props
}: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props} attribute="class">
            {children as ReactNode}
        </NextThemesProvider>
    );
}
