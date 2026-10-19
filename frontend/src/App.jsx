import { useState } from 'react'
import './App.css' ;
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Main_navbar from './Components/Navbars/main_Nav';
import { Routes, Route } from "react-router-dom";
import Home_page from './Web_pages/Main_page'
import Main_footer from './Components/footers/Main_footer'
import {Sign_up_page} from './Web_pages/Sign_up';
import {Login_page} from './Web_pages/Login';
import { About_page } from './Web_pages/About_page';
import {Contact_page} from './Web_pages/contact_us_page';
import { Terms_privacy_policy_page } from './Web_pages/Terms_privacy_policy';
import Otp_verification_page from './Web_pages/otp_verification_page';
import { Destination_page } from './Web_pages/destination_page';
import {Forget_password_Page} from './Web_pages/forget_password';
import { Update_pas_page } from './Web_pages/update_pas_page';
import { Dashboard_page } from './Web_pages/Dashboard_page';
import { SettingPage } from './Web_pages/setting';
import { ProfilePage } from './Web_pages/profilePage';
import {NotificationPage} from './Web_pages/notifications';
import { InputPasswordChangeEmailDelAcc } from './Web_pages/changeEmail&delAcc_inputPassword';
import { TaskHistoryPage } from './Web_pages/history_Page';
import { Auth_context } from './Context/authContext';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

function App() {

const { logined } = useContext(Auth_context);

  return (
    <>
     <ToastContainer position="top-center"
       autoClose={5000}
       hideProgressBar={false}
       newestOnTop={false}
       closeOnClick={false}
       rtl={false}
       pauseOnFocusLoss
       draggable
       pauseOnHover
       theme="light"
       transition={Bounce}
     />
     <Main_navbar/>
  <Routes>
   <Route
      path="/"
      element={
         logined
            ? <Navigate to="/destination_page" replace />
            : <Home_page />
      }
   />

   <Route
      path="destination_page"
      element={
            <Destination_page />
      }
   />

   {/* Baaki tumhare existing routes yahan rahenge */}
        <Route path='Sign_up' element= {<Sign_up_page/>} />
        <Route path='Log_in' element= {<Login_page/>} />
        <Route path='About' element= {<About_page/>} />
        <Route path='contact' element= {<Contact_page/>} />
        <Route path='policy_page'element ={< Terms_privacy_policy_page/>} />
        <Route path='otp_verification/:purpose' element ={<Otp_verification_page/>} />
        <Route path='forget_Password/:purpose' element ={<Forget_password_Page/>} />
        <Route path='update_Password/:token' element ={<Update_pas_page/>} />
        <Route path='dashboard' element ={<Dashboard_page/>} />
        <Route path='setting' element={<SettingPage/>} />
        <Route path='profilePage' element={<ProfilePage/>} />
        <Route path='notification' element={<NotificationPage/>} />
        <Route path='inputPassword/:purpose' element={<InputPasswordChangeEmailDelAcc/>} />
        <Route path ="historyPage" element={<TaskHistoryPage/>} />
      </Routes>
      <Main_footer/>
    </>
  )
}

export default App;
