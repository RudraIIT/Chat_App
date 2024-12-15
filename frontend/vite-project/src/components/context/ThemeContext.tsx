import { useState, useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            return prevTheme === 'light' ? 'dark' : 'light';
        });
    }

    return (
        <div className={`h-screen ${theme === "dark" ? "dark" : ""}`}>
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded"
            >
                {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
            {children}
        </div>
    );
}