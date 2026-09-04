import React, { createContext, useContext, useState, useEffect } from 'react';

const FontContext = createContext();

export const FontProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('app-font-size') || 'normal';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Set root font size percentages to scale rem units automatically
        switch (fontSize) {
            case 'xs':
                root.style.fontSize = '75%'; // ~12px base
                break;
            case 'small':
                root.style.fontSize = '80%'; // ~14px base
                break;
            case 'normal':
                root.style.fontSize = '90%'; // 16px
                break
            case 'large':
                root.style.fontSize = '100%'; // ~18px base
                break;
            default:
                root.style.fontSize = '100%'; // 16px default
                break;
        }

        localStorage.setItem('app-font-size', fontSize);
    }, [fontSize]);

    return (
        <FontContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontContext.Provider>
    );
};

export const useFont = () => useContext(FontContext);