import React, { FC, useContext, useEffect, useState } from 'react';
import './businessHeaderStyles.css';
import { ThemeContext, isDark } from '@librechat/client';

interface StartupConfig {
  businessChatTitle?: string;
  businessChatTitleFont?: string;
  businessChatTitleFontWeight?: string;
  businessChatTitleFontSize?: string;
  businessChatLogo?: string;
  businessChatLogoDark?: string
  businessChatBackgroundLight?: string;
  businessChatBackgroundDark?: string;
  businessChatTitleLight?: string;
  businessChatTitleDark?: string;
}

const BusinessHeader: FC = () => {
  const { theme } = useContext(ThemeContext);
  const [darkMode, setDarkMode] = useState<boolean>(isDark(theme));
  const [businessName, setBusinessName] = useState<string>("");
  const [logoURL, setLogoURL] = useState<string>("");
  const [data, setData] = useState<StartupConfig | null>(null);
  const [backgroundLight, setBackgroundLight] = useState<string>("");
  const [backgroundDark, setBackgroundDark] = useState<string>("");
  const [titleLight, setTitleLight] = useState<string>("");
  const [titleDark, setTitleDark] = useState<string>("");
  const [titleFont, setTitleFont] = useState<string>("");
  const [titleFontWeight, setTitleFontWeight] = useState<string>("");
  const [titleFontSize, setTitleFontSize] = useState<string>("");

  // Actualizar darkMode cuando cambie el tema o la preferencia del sistema
  useEffect(() => {
    setDarkMode(isDark(theme));

    // Si el tema es 'system', escuchar cambios en la preferencia del sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setDarkMode(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/config", {
          headers: {
            "accept": "application/json, text/plain, */*",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          method: "GET"
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result: StartupConfig = await response.json();
        setData(result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const logo = darkMode ? data.businessChatLogoDark : data.businessChatLogo;
      setBusinessName(data.businessChatTitle || "");
      setLogoURL(logo || "");
      setBackgroundLight(data.businessChatBackgroundLight || "");
      setBackgroundDark(data.businessChatBackgroundDark || "");
      setTitleLight(data.businessChatTitleLight || "");
      setTitleDark(data.businessChatTitleDark || "");
      setTitleFont(data.businessChatTitleFont || "");
      setTitleFontWeight(data.businessChatTitleFontWeight || "");
      setTitleFontSize(data.businessChatTitleFontSize || "");
    }
  }, [data, darkMode]);


  const titleStyle: React.CSSProperties = {
    color: darkMode ? titleDark : titleLight,
    fontFamily: titleFont || 'Inter, sans-serif',
    fontWeight: titleFontWeight || 'bold',
    fontSize: titleFontSize || '16px',
  };

  return (
    <div id="chat_title" className="business-title" style={{ backgroundColor: darkMode ? backgroundDark : backgroundLight }}>
      <img src={logoURL} className="chat-logo" alt="Logo" />
      <p className="business-name text-text-primary" style={titleStyle}>
        {businessName}
      </p>
    </div>
  );
};

export default BusinessHeader;
