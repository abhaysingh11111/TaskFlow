import './Sign_up.css'
import React, { useState } from 'react'
import app_logo from '../assets/RTI_To_do_app.png'
import { Link } from 'react-router-dom'
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from '../Components/Spinner/spinner'
import { toast } from 'react-toastify' ;
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import loginBg_img from '../assets/loginBg.png';

export const Sign_up_page = () => {

    const navigate = useNavigate() ;
    const [userName , setuserName] = useState("") ;
    const [passWord , setpassWord] = useState("") ;
    const [confirm_Password , setconfirm_Password] = useState("") ;
    const [fullName , setfullName] = useState("") ;
    const [email , setEmail] = useState("") ;
    const [process, setProcess] = useState(false) ;
    const [isViewpas , setIsviewpas] = useState(false) ;
    const [isViewconfirmPas , setIsviewConfirmpas ] = useState(false) ;

    const Handle_submit = async(e) =>{
          e.preventDefault() ;
          setProcess(true) ;

          const userNameRegex = /^(?!.*__)[a-z][a-z0-9_]{2,19}(?<!_)$/i ;
          const passWordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]).{8,64}$/;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const fullNameRegex = /^(?=.{2,50}$)[\p{L}]+(?:[ .'-][\p{L}]+)*$/u;

          if(passWord !== confirm_Password){
            setProcess(false) ;
            toast.error("Enter same password in both field")            ;
          }

         else if(!userNameRegex.test(userName)){
            setProcess(false) ;
            toast.error("enter valid Username")
          }

         else if(!passWordRegex.test(passWord)){
             console.log("password error");
             setProcess(false) ;
             toast.error("Invalid password") ;
          }
         else if(!emailRegex.test(email)){
            setProcess(false) ;
            toast.error("enter valid Email") ;
          }
         else if(!fullNameRegex.test(fullName)){
            setProcess(false) ;
            toast.error("Invalid Fullname") ;
          }
     else{

       try{
         // now send req to backend
         const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signup/signup`,{
            method :"POST",
            credentials :"include",
            headers:{
                "Content-Type" : "application/json"
            },
           body: JSON.stringify({userName: userName.trim(),passWord,fullName: fullName.trim(),
                                 email: email.trim(),confirm_Password})
           }
         );

        // now parse the req body
        const parsed_data = await req.json() ;
        setProcess(false) ;

        if(req.status === 400){
                       console.log("password error 400");

          toast.error("Something went wrong try again") ;
        }
        else if(req.status === 409 && parsed_data.error === "Emailalreadyregistered"){
          toast.error("Email already registered .") ;
        }
        // yha se
        else if(req.status === 409 && parsed_data.error === "Usernamealreadyexists"){
          toast.error("Try with different Username .") ;
        }
        // when email blocked for 24 hrs due to max otp attempt reached per day
        else if(req.status === 429){
            toast.error("maximum limit reached try again after 24hrs .") ;
        }
        else if(req.status === 403){
            toast.error("try again after 1 minute .") ;
        }
        else if(!req.ok){
                       console.log("password error ok error"+req.status);

          toast.error("something went wrong try againm .") ;
        }
        else{
            toast.success("OTP sent successfully .")
            sessionStorage.setItem("Email", email);
            navigate(`/otp_verification/signup`) ;
        }
      }
      catch(err){
          setProcess(false) ;
          toast.error("Internal server error try again later") ;
          console.log(err.message) ;
      }
   }
 }

  return (

  <div className='Sign_up_containor' style={{backgroundImage: `url(${loginBg_img})` , backgroundSize: "cover" ,}} >
   <form className="signUp_form" onSubmit={Handle_submit}>
     <img src= {app_logo} alt="app logo" className='sign_up_app_logo'/>
       <div> <h2>Create Your</h2> <span> Account </span></div>
       <h2>Let's get you started 🚀</h2>
    <fieldset  className="input_box_wrappor" disabled ={process}>
        <input type="text" required placeholder="Username" className='userName_ibx' onChange={(e)=>setuserName(e.target.value)} value={userName} spellCheck={false} aria-label='Username input box'/>
        <input type="text" required placeholder="Fullname" className='fullName_ibx' onChange={(e)=>setfullName(e.target.value)} value={fullName} spellCheck={false} aria-label='Fullname input box'/>
        <input type="email" required placeholder="Email" className='Email_ibx'  onChange={(e)=>setEmail(e.target.value)} value={email} spellCheck={false} aria-label='Email input box'/>

        <div className='passwordWrappor'>
           <input
             type={isViewpas ? "text" : "password"}
             required
             aria-label='Password input box'
             spellCheck={false}
             placeholder="Password"
             className='passWord_ibx'
             onChange={(e)=>setpassWord(e.target.value)} value={passWord}
           />
          {isViewpas
             ?(
               <IoMdEye className='eye-On' onClick={()=>setIsviewpas(false)} aria-label="Hide password"/>
             )
             :(
               <IoMdEyeOff className='eye-Off' onClick={()=>setIsviewpas(true)} aria-label="Show password"/>
             )
          }
        </div>
        <div className='confirmPasswordWrappor'>
            <input
              type={isViewconfirmPas ? "text" : "password"}
              required
              placeholder="Confirm password"
              className='conform_Password_ibx'
              onChange={(e)=>setconfirm_Password(e.target.value)} value={confirm_Password}
              spellCheck={false}
              aria-label='Confirm password input box'
            />
             {isViewconfirmPas
              ?(
                 <IoMdEye className='eye-On'onClick={()=>setIsviewConfirmpas(false)}    aria-label="hide password"/>
               )
              :(
                 <IoMdEyeOff className='eye-Off' onClick={()=>setIsviewConfirmpas(true)} aria-label="show password"/>
               )
            }
        </div>
        <button type="submit" className='signUp_btn'>Sign Up</button>
          {process &&(
            <Spinner></Spinner>
          )}
         <div className='loginRedirectWrapper'>Already have an account <Link to="/log_in"   style={{pointerEvents: process ? "none" : "auto",opacity: process ? 0.5 : 1,cursor: process ? "not-allowed" : "pointer"}}>Login</Link></div>
    </fieldset>

  </form>
 </div>
 )
}