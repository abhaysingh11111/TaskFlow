import React, { useState } from 'react';
import { useContext } from 'react';
import './update_pas_page.css';
import { Spinner } from '../Components/Spinner/spinner';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import app_icn from '../assets/RTI_To_do_app.png';
import { toast } from 'react-toastify';
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Auth_context } from '../Context/authContext';

export const Update_pas_page = () => {

   const { token } = useParams();
   const [searchParams] = useSearchParams();
   const purpose = searchParams.get("purpose");
   const [password, setPassword] = useState("");
   const [confirm_Password, set_confirm_Password] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const [isViewpas, setIsviewPas] = useState(false);
const { logined, setLogined } = useContext(Auth_context);

   // reusable error toast
   const showError = (message, id) => {
      toast.error(message, {
         toastId: id
      });
   };

   // reusable success toast
   const showSuccess = (message, id) => {
      toast.success(message, {
         toastId: id
      });
   };

   // normal password reset submit
   const handle_Submit = async () => {

      setLoading(true);

      try {
         const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/forgetPassword/updatePassword`,
            {
               method: "POST",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json"
               },
               body: JSON.stringify({
                  token,
                  passWord: password,
                  confirm_Password: confirm_Password
               })
            }
         );

         setLoading(false);

         if (req.status === 400) {

            showError(
               "Something went wrong try again later",
               "something-wrong"
            );
         }
         else if (req.status === 401) {

            showError(
               "Unauthorized request",
               "unauthorized-request"
            );
         }
         else if (req.status === 500) {

            showError(
               "Internal server error try again after some time",
               "internal-server-error"
            );
         }
         else if (!req.ok) {

            showError(
               "Something went wrong try again later.",
               "req-not-ok"
            );
         }
         else {

            showSuccess(
               "Password updated successfully.",
               "password-updated"
            );

            navigate(`/destination_page`);
         }
      }
      catch (err) {
         setLoading(false);
         console.log(err.message);
         showError(
            "Internal server error try again after some time",
            "catch-internal-server-error"
         );
      }
   };

   // for change email and delAcc when user forget password
   const changeEmail_delAcc_resetPassword = async (routeAddress,routeWrapperAddress) => {
      console.log("inside change email del acc forger password page ")
      setLoading(true);
      try {
         const allowedRoutes = [
            "changeEmailForgetpasswordResetPassword",
            "deleteAccountForgetpasswordResetPassword",
            "passwordUpdate",
            "forgetPasswordforChangepassword_Reset"
         ];

         if (!allowedRoutes.includes(routeAddress)) {

            setLoading(false);

            showError(
               "Invalid request",
               "invalid-route"
            );
            return;
         }

         const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/account-API/${routeWrapperAddress}/${routeAddress}`,
            {
               method: "POST",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json"
               },
               body: JSON.stringify({
                  token,
                  passWord: password,
                  confirm_Password: confirm_Password
               })
            }
         );

         console.log("req ftech toh hui")
         const parseData = await req.json();
         setLoading(false);

         if (req.status === 401 || req.status === 404) {
            console.log(req.status);
            showError(
               "Unauthorized request",
               "change-email-unauthorized"
            );
         }

         else if (req.status === 400) {

            if (parseData.message === "all fields required") {

               showError(
                  "All fields are required",
                  "all-fields-required"
               );
            }

            else if (parseData.message === "passwords do not match") {

               showError(
                  "Passwords do not match",
                  "change-email-password-not-match"
               );
            }

            else if (parseData.message === "invalid password format") {

               showError(
                  "Invalid password format",
                  "invalid-password"
               );
            }

            else if (parseData.message === "invalid or expired token") {

               showError(
                  "Invalid or expired token",
                  "expired-token"
               );
            }

            else {

               showError(
                  "Something went wrong",
                  "change-email-something-wrong"
               );
            }
         }

         else if (req.status === 500) {
            showError(
               "Network error try again after some time",
               "network-error"
            );
         }

         else if (!req.ok) {
            showError(
               "Something went wrong try again later.",
               "change-email-req-not-ok"
            );
         }
         else {
            showSuccess(
               "Password updated successfully please reLogin.",
               "password-updated-relogin"
            );
            if(purpose === "changePassword"){
               return navigate(`/destination_page`) ;
            }
            else{
               setLogined(false) ;
               return navigate(`/Log_in`);
            }
         }
      }

      catch (err) {
         setLoading(false);
         showError(
            "Internal server error try again after some time na ba ",
            "change-email-catch-error"
         );

         console.error(err);
      }
   };

   // password validator
   const passwordValidator = async(e) => {

      e.preventDefault();
      setLoading(true);

      if (!token) {
         setLoading(false);
         showError(
            "Invalid or missing token",
            "invalid-token"
         );
         return;
      }

      const passWordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]).{8,64}$/;

      if (password !== confirm_Password) {
         setLoading(false);
         showError(
            "Passwords do not match",
            "password-not-match"
         );
         return;
      }

      else if (!passWordRegex.test(password)) {
         setLoading(false);
         showError(
            "Password must contain uppercase, lowercase, number and special character.",
            "invalid-password-format"
         );
         return;
      }

      else {
         let routeAddress, routeWrapperAddress = "";

         if(purpose === "changeEmailforgetPassword") {
            routeAddress = "changeEmailForgetpasswordResetPassword";
            routeWrapperAddress = "changeEmail";
            await changeEmail_delAcc_resetPassword(routeAddress,routeWrapperAddress);
         }
         else if(purpose === "deleteAccountforgetPassword") {
            routeAddress = "deleteAccountForgetpasswordResetPassword";
            routeWrapperAddress = "deleteAccount";
            await changeEmail_delAcc_resetPassword(routeAddress,routeWrapperAddress);
         }
         else if(purpose === "changePassword"){
            routeAddress = "passwordUpdate";
            routeWrapperAddress = "changePassword";
            await changeEmail_delAcc_resetPassword(routeAddress,routeWrapperAddress);
         }
         else if(purpose === "forgetPasswordforChangepassword"){
            routeAddress = "forgetPasswordforChangepassword_Reset";
            routeWrapperAddress = "changePassword";
            await changeEmail_delAcc_resetPassword(routeAddress,routeWrapperAddress);
         }
         else{
            handle_Submit();
         }
      }
   };

   return (
      <form onSubmit={passwordValidator} className='form_bodyyyy'>

         <fieldset disabled={loading} className='wrappor_update' >
             <img src={app_icn} alt="server error" className='app_icn'/>

            <div className='newPassinputBoxwrapper'>
               <input
                  type={isViewpas ? "text" : "password"}
                  placeholder='Enter new password'
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className='new_pas_ibx'
               />
               <span className='PasswordEyewrapper'>

                   {isViewpas
                     ? (
                        <IoMdEye
                           onClick={() => setIsviewPas(false)}
                        />
                     )
                     : (
                        <IoMdEyeOff
                           onClick={() => setIsviewPas(true)}
                        />
                     )
               }
               </span>

            </div>

            <div className='confirmNewpassInputboxWrapper'>

               <input
                  type={isViewpas ? "text" : "password"}
                  placeholder='confirm password'
                  onChange={(e) => set_confirm_Password(e.target.value)}
                  value={confirm_Password}
                  className='confirm_pas_ibx'
               />
              <span className='confirmPasswordEyewrapper'>
               {isViewpas
                     ? (
                        <IoMdEye
                           onClick={() => setIsviewPas(false)}
                           className='eyeOnicn'
                        />
                     )
                     : (
                        <IoMdEyeOff
                           onClick={() => setIsviewPas(true)} className='eyeOfficn'
                        />
                     )
               }
              </span>
            </div>

            <button  type="submit" className='submit_btn' >
               Submit
            </button>

            {loading &&
               (
                  <Spinner />
               )
            }
         </fieldset>
      </form>
   );
};