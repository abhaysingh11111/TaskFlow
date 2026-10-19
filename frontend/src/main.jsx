import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Auth_context, AuthProvider } from './Context/authContext.jsx';
import { Lang_provider, lang_Context } from './Context/lang_Context.jsx';
import { DashboardProvider} from './Context/dashboardRefresh_Context.jsx';

createRoot(document.getElementById('root')).render(

   <GoogleOAuthProvider clientId="635858125459-amq2e8gd72t8cicrc7lm6oq76uce43ik.apps.googleusercontent.com">
      <BrowserRouter>
         <AuthProvider>
            <DashboardProvider>
            <Lang_provider>
               <App />
            </Lang_provider>
            </DashboardProvider>
         </AuthProvider>
      </BrowserRouter>
   </GoogleOAuthProvider>

) ;