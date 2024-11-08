import React, { FC, useContext, useEffect, useState } from 'react';
import './businessHeaderStyles.css';
import { ThemeContext } from '~/hooks';

interface StartupConfig {
  businessChatTitle?: string;
  businessChatLogo?: string;
  businessChatBackgroundLight?: string;
  businessChatBackgroundDark?: string;
}

const BusinessHeader: FC = () => {
  const { theme } = useContext(ThemeContext);
  const [businessName, setBusinessName] = useState<string>("");
  const [logoURL, setLogoURL] = useState<string>("");
  const [data, setData] = useState<StartupConfig | null>(null); 
  const [backgroundLight, setBackgroundLight] = useState<string>("");
  const [backgroundDark, setBackgroundDark] = useState<string>("");

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
      setBusinessName(data.businessChatTitle || ""); 
      setLogoURL(data.businessChatLogo || ""); 
      setBackgroundLight(data.businessChatBackgroundLight || "");
      setBackgroundDark(data.businessChatBackgroundDark || "");
    }
  }, [data]);

 
  return (
    <div id="chat_title" className="business-title" style={{backgroundColor:theme === 'dark' ?backgroundDark:backgroundLight}}>
      <img src={logoURL} className="chat-logo" alt="Logo"/>
      <p className= "business-name text-text-primary" style={{color:theme === 'dark' ? 'white':'black'}}>
        {businessName}
      </p>
    </div>
  );
};

export default BusinessHeader;