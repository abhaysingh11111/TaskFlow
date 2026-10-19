import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Logo from '../assets/RTI_To_do_app.png';
import { useNavigate, useParams } from "react-router-dom";
import './changeEmaildelAccinputPassword.css';
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import {Spinner} from '../Components/Spinner/spinner'

export const InputPasswordChangeEmailDelAcc = () => {

   const [password, setPassword] = useState("");
   let { purpose } = useParams();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [showPassword , setShowPassword] = useState(false) ;

   /* ================= TOAST HELPERS ================= */

   const showError = (msg) => {
      toast.error(msg, {
         toastId: msg
      });
   };

   const showSuccess = (msg) => {
      toast.success(msg, {
         toastId: msg
      });
   };

 // send req for forget password to otp sender for changeEmail or del acc
 const forgetPassword_changeEmail_or_delAccount = async () => {
    setLoading(true);
    let routeAddress = ""; let routeWrapper = "";

      if(purpose === "changeEmail") {
         routeAddress = "changeEmailForgetpassword";
         routeWrapper = "changeEmail";
         console.log("change email forget password route called");
      }
      else if (purpose === "deleteAccount") {
         routeAddress = "deleteAccountForgetpassword";
         routeWrapper = "deleteAccount";
         console.log("delete account forget password route called");
      }
      else if(purpose === 'changePassword'){
         routeAddress = "forgetPasswordforChangepassword";
         routeWrapper = "changePassword";
      }
      else{
         showError("Something went wrong.");
         setLoading(false);
         console.log("for forget password") ;
         return;
      }

      try{
         const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/account-API/${routeWrapper}/${routeAddress}`,
            {
               method: "POST",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json"
               }
            }
         );

         console.log(req) ;
         setLoading(false);

         if (req.status === 400) {
            showError("Unable to process your request.");
         }
         else if (req.status === 401) {
            showError("Unauthorized Access.");
         }
         else if (req.status === 403) {
            showError("try again after 1 minute");
         }
         else if (req.status === 404) { // abhi yha hai
            showError("Service currently unavailable.");
         }
         else if (req.status === 429){
            showError("Too many attempts. Please wait and try again after 24 hours.");
         }
         else if (!req.ok){
            showError("Something went wrong try again later.");
         }
         else{
            const parseData = await req.json();
            sessionStorage.setItem("Email", parseData.email);

            if(purpose === "changeEmail") {
               purpose = "changeEmailForgetPassword";
            }
            if(purpose === "deleteAccount") {
               purpose = "deleteAccountForgetPassword";
            }
            if(purpose === "changePassword"){
               purpose = "forgetPasswordforChangepassword";
            }
            navigate(`/otp_verification/${purpose}`);
         }
      }
      catch(err) {
         setLoading(false);
         showError("Network error please try again later");
         console.log(err.message);
      }
   };

   const handleSubmit = async (e) => {

      e.preventDefault();
      setLoading(true);
      const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

      if (!passwordRegex.test(password)) {
         setLoading(false);
         showError(
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be 8+ characters long."
         );
         return;
      }
      else {
         let routeAddress; let routeWrapper;
         if (purpose === "changeEmail") {
            routeAddress = "password_Matching";
            routeWrapper = "changeEmail" ;
         }
         else if (purpose === "deleteAccount") {
            routeAddress = "deleteAccount";
            routeWrapper = "deleteAccount" ;
         }
         else if(purpose === "changePassword"){
            routeAddress = "passwordCompare";
            routeWrapper = "changePassword" ;
         }
         else {
            setLoading(false);
            navigate('/setting');
            showError("Something went wrong try again later");
            return;
         }

         try {
           const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/account-API/${routeWrapper}/${routeAddress}`,
               {
                  method: "POST",
                  credentials: "include",
                  headers: {
                     "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ password })
               }
           );

            const parseData = await req.json();
            setLoading(false);
            console.log("after req") ;

            if (purpose ===
               "DeleteAccount and changeEmail inputPassword case purpose is deleteAccount" &&
               req.status === 400) {
               showError("Sometdddhing went wrong try again later");
            }
            else if (req.status === 400) {
               showError("Invalid password syntax");
            }
            else if (req.status === 401) {
               showError("Wrong Password");
            }
            else if (req.status === 500) {
               showError("Internal Server Error");
            }
            else if (req.status === 404) {
               showError("User not found");
            }
            else if (req.status === 429) {
               showError("Maximum limit reached try again after 24hrs");
            }
            else if (req.status === 403) {
               showError("try again after 1 minute");
            }
            else if (!req.ok) {
               showError("Something went wrong");
            }
            else {
               showSuccess("Password Verified Successfully");
               if(purpose === "changeEmail") {
                  const token = parseData.token;
                  return navigate(`/forget_Password/changeEmail?token=${token}`);

               }
               if(purpose === "deleteAccount") {
                  const email = parseData.email;
                  console.log(email+"email received after password matching"); ;
                  sessionStorage.setItem("Email", email);
                  console.log("email set in sessionStorage =", email);
                  return navigate(`/otp_verification/deleteAccount`) ;
               }
               if(purpose === "changePassword") {
                  const email = parseData.email;
                  sessionStorage.setItem("Email", email);
                  return navigate(`/update_Password/${parseData.token}`) ;
               }
            }
         }
         catch (err) {
            setLoading(false);
            showError("Network error");
            console.log(err.message);
         }
      }
   }

   return (

      <form onSubmit={handleSubmit} className='inputPassword-containor'>

         <fieldset className='inputForm_wrapper' disabled={loading}>
            <img
              src={Logo}
              alt="Logo"
              className='app-Logo'
           />
           <div className='passswordInputWrapper'>
            <input
               type= {showPassword ? "text" :"password"}
               placeholder='Enter your password'
               onChange={(e) => setPassword(e.target.value)}
               value={password}
               className='changeEmail_delAcc_pas_inputBox'
            />
            <button type='button'>
               {showPassword
                 ?(
                   <IoMdEye onClick={()=>setShowPassword(false)}/>
                 )
                 :(
                   <IoMdEyeOff onClick={()=>setShowPassword(true)}/>
                 )
               }
            </button>
           </div>
           {/*Spinner loader*/}
           {loading&&(
              <Spinner/>

           )}
            <button type='submit'>
               Submit
            </button>
          <button  type="button"
            onClick={forgetPassword_changeEmail_or_delAccount}
            className='forgetPasswordbtn'
          >
           Forget password
          </button>
         </fieldset>
      </form>
   );
};