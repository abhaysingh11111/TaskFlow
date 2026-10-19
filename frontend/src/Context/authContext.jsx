import { useState , useEffect, createContext } from "react";

export const Auth_context = createContext() // MAKED AN OJECT JO GLOBAL DATA STORE KAREGA

  export const AuthProvider = ({ children }) => {

     const [logined , setLogined] = useState(false) ;
     const [authLoading, setAuthLoading] = useState(true);

    /* send to req to backend for make the nav dynamic */
   useEffect(()=> {

     const isLogined = async() =>{

       try{
         const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login/is_Logined`,{
            headers:{
              "Content-Type": "application/json"
            } ,
             credentials: "include"
           }
         ) ;

        if(req.status === 200){
           setLogined(true) ;
        }
        else{
           setLogined(false) ;
           return ;
        }
      }
      catch(err){
         console.log(err.message) ;
          setLogined(false) ;
         return ;
      }
      finally{
        setAuthLoading(false);
      }
    };isLogined()
   },[logined]
)

return(
  <Auth_context.Provider value={{logined,setLogined ,authLoading, AuthProvider}}>
    {children}
  </Auth_context.Provider>
)
}