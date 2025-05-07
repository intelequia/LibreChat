// import React, { forwardRef, MutableRefObject, useEffect, useState } from 'react';
// import './tokenCounter.css'
// import Cookies from 'js-cookie';
// import { useAuthContext } from '~/hooks';
// import { useChatContext } from '~/Providers';
// import { buildTree } from '~/utils';
// import { useFileMapContext } from '~/Providers';
// import { getMessagesByConvoId } from 'librechat-data-provider/dist/types/data-service';

// interface StartupConfig {
//   businessChatTitle?: string;
//   businessChatLogo?: string;
//   businessChatBackgroundLight?: string;
//   businessChatBackgroundDark?: string;
//   balanceEnabled?:boolean;
// }

// interface CharacterCountProps {
//   textAreaRef: MutableRefObject<HTMLTextAreaElement | null>;
// }

// const TokenCounter = forwardRef<HTMLTextAreaElement, CharacterCountProps>(({ textAreaRef }, ref) => {
//   const [data, setData] = useState<StartupConfig | null>(null); 
//   const [tokenBalance, setTokenBalance] = useState(0);
//   const [tokenUsage, setTokenUsage] = useState(0); 
//   const authContext = useAuthContext();
//   const { conversation } = useChatContext();
//   const fileMap = useFileMapContext();
//   const [tokenLabel,setTokenLabel] = useState("")

//   const messagesQuery = getMessagesByConvoId(conversation?.conversationId ?? '' );

//   useEffect(() => {
//     fetchData();
//     fetchBalance();
//   }, []);

//   useEffect(() =>{
//     if(messagesQuery.status === "success" )
//       data?.balanceEnabled == true ? fetchBalance() : setTokenUsage(0);
    
//     if(messagesQuery.status === "loading" && data?.balanceEnabled == true)
//       setTokenUsage(0);

//   }, [messagesQuery.data, messagesQuery.status ])


//   const fetchData = async () => {
//     try {
//       const response = await fetch("/api/config");
//       if (!response.ok) throw new Error('Network response was not ok');
//       const result: StartupConfig = await response.json(); 
//       setData(result);  
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const fetchBalance = async () => {
//     if (!authContext.token) {
//       console.error("Authorization token is missing");
//       return; 
//     }

//     try {
//       const refreshToken = Cookies.get('refreshToken');
//       const connect_sid = Cookies.get('connect.sid');
//       const cookieString = `connect.sid=${connect_sid}; refreshToken=${refreshToken}`;
//       const response = await fetch("/api/balance", {
//         headers: {
//           "cookie": cookieString,
//           "authorization": "Bearer " + authContext.token
//         },
//       });

//       if (!response.ok) throw new Error('Network response was not ok');
//       const result = Math.floor ( await response.json() ); 
//       setTokenBalance(result);
//       setTokenUsage(result); 
//     } catch (error) {
//       console.error("Error fetching balance:", error);
//     }
//   };

//   useEffect(() => {
//     const updateCharCount = () => {
//       if (textAreaRef.current) {
//         const estimatedTokens =  Math.ceil(textAreaRef.current.value.length / 4);
//         data?.balanceEnabled == true ? setTokenUsage(tokenBalance - estimatedTokens): setTokenUsage(estimatedTokens);
//       }
//     };

//     const textarea = textAreaRef.current;
//     if (textarea) {
//       textarea.addEventListener('input', updateCharCount);
//     }

//     return () => {
//       if (textarea) {
//         textarea.removeEventListener('input', updateCharCount);
//       }
//     };
//   }, [textAreaRef, tokenBalance]); 

//   useEffect(() => {
//     data?.balanceEnabled == true ? setTokenLabel("Remainig Token: ") : setTokenLabel("Tokens: ")
//   },[data])


//   return <div className="tokens">{tokenLabel} {tokenUsage}</div>;
// });

// export default TokenCounter;