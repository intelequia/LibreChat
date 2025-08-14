import React, { FC, useContext, useEffect, useState } from 'react';
import './businessHeaderStyles.css';
import { ThemeContext } from '@librechat/client';

interface StartupConfig {
  businessChatTitle?: string;
  businessChatLogo?: string;
  businessChatLogoDark?: string
  businessChatBackgroundLight?: string;
  businessChatBackgroundDark?: string;
  businessChatTitleLight?: string;
  businessChatTitleDark?: string;
}

const BusinessHeader: FC = () => {
  const { theme } = useContext(ThemeContext);
  const [businessName, setBusinessName] = useState<string>("");
  const [logoURL, setLogoURL] = useState<string>("");
  const [data, setData] = useState<StartupConfig | null>(null); 
  const [backgroundLight, setBackgroundLight] = useState<string>("");
  const [backgroundDark, setBackgroundDark] = useState<string>("");
  const [titleLight, setTitleLight] = useState<string>("");
  const [titleDark, setTitleDark] = useState<string>("");

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
        console.log(response);
        setData(result);  
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const logo = (theme === 'dark')? data.businessChatLogoDark : data.businessChatLogo
      setBusinessName(data.businessChatTitle || ""); 
      setLogoURL( logo || ""); 
      setBackgroundLight(data.businessChatBackgroundLight || "");
      setBackgroundDark(data.businessChatBackgroundDark || "");
      setTitleLight(data.businessChatTitleLight || "");
      setTitleDark(data.businessChatTitleDark || "");
    }
  }, [data]);

 
  return (
    <div id="chat_title" className="business-title" style={{backgroundColor:theme === 'dark' ?backgroundDark:backgroundLight}}>
      <img src={logoURL} className="chat-logo" alt="Logo"/>
      <p className= "business-name text-text-primary" style={{color:theme === 'dark' ? titleDark:titleLight}}>
        {businessName}
      </p>
    </div>
  );
};

export default BusinessHeader;