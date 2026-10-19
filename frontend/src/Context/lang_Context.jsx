import { useContext , useEffect,createContext, useState } from "react";

export const lang_Context = createContext() ; // firstly define the global lang context proider

export const Lang_provider = ({children})=>{
     const [lang , setLang] = useState('en') ; // default lang english

   useEffect(()=>{
        localStorage.setItem("lang", lang);
   },[lang]) ; // when lang chnages than Refresh pe bhi lang same rhe

   // now value ko context hook ke saath lagana
   return <lang_Context.Provider value ={{lang ,setLang}}>
            {children}
          </lang_Context.Provider>
}