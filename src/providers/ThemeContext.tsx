// src/providers/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = { isDark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => { } });
export const useTheme = () => useContext(ThemeContext);

const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
        // neutral-950 = #0a0a0a
        root.style.setProperty("--bg-page", "#0a0a0a");
        root.style.setProperty("--bg-card", "#111111");
        root.style.setProperty("--bg-card-hover", "#161616");
        root.style.setProperty("--text-primary", "#f5f5f5");
        root.style.setProperty("--text-secondary", "#a3a3a3");
        root.style.setProperty("--text-muted", "#525252");
        root.style.setProperty("--border-default", "rgba(255,255,255,0.08)");
        root.style.setProperty("--border-hover", "rgba(255,255,255,0.16)");
        document.documentElement.classList.add("dark");
    } else {
        root.style.setProperty("--bg-page", "#f5f5f5");
        root.style.setProperty("--bg-card", "#ffffff");
        root.style.setProperty("--bg-card-hover", "#fafafa");
        root.style.setProperty("--text-primary", "#0a0a0a");
        root.style.setProperty("--text-secondary", "#525252");
        root.style.setProperty("--text-muted", "#a3a3a3");
        root.style.setProperty("--border-default", "rgba(0,0,0,0.07)");
        root.style.setProperty("--border-hover", "rgba(0,0,0,0.12)");
        document.documentElement.classList.remove("dark");
    }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem("theme");
        if (stored) return stored === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        applyTheme(isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggleTheme = () => setIsDark((v) => !v);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};