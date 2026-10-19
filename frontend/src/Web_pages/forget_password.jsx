import './forget_pas.css' ;
import App_logo from '../assets/RTI_To_do_app.png' ;
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {Spinner} from "../Components/Spinner/spinner";
import { toast } from 'react-toastify';
import { IoMdMail } from "react-icons/io";
import Envolop from '../assets/envolopImg.png' ;
import bgImg from '../assets/9YQUV.jpg' ;

 export const Forget_password_Page = () =>{

    const [loading , setLoading] = useState(false) ;
    const [email , setEmail] = useState("") ;
    const navigate = useNavigate() ;
    const {purpose} = useParams() ;
    const [searchParams] = useSearchParams() ;
    const token = searchParams.get("token") ;

  const handle_Submit = async(e) =>{

     e.preventDefault() ;
     setLoading(true) ;

     const email_Regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

     if(!email){
         setLoading(false) ;
         toast.error("Email is required") ;
         return ;
     }

     if(!email_Regex.test(email)){
        setLoading(false) ;
        toast.error("Invalid email try again") ;
        return ;
     }

    try{

      let req ;

      if(token === null){
         req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/forgetPassword/forgetPassword`,{
            headers:{
               "Content-Type" : "application/json"
            },
            method:"POST",
            credentials :"include",
            body:JSON.stringify({email:email ,...(token && { token }),purpose})
         }) ;
      }
      else{
         console.log("token found in url update email") ;
         // abhi route ka address change karenge send to change new email verification
         req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/account-API/changeEmail/changeEmail`,{
            headers:{
              "Content-Type" : "application/json"
            },
            method:"POST",
            credentials :"include",
            body:JSON.stringify({email:email ,token,purpose})
         }) ;
      }

      console.log("req sent"+req.status) ;
      const parseData = await req.json() ;
      setLoading(false) ;

      if(req.status  === 400 && parseData.purpose === "changeEmail"){
         toast.error("Something went wrong try again") ;
         return ;
      }
      else if(req.status === 401 && parseData.purpose === "changeEmail"){
        toast.error("Session expired .") ;
      }
      else if(req.status === 409 && parseData.purpose === 'changeEmail'){
         toast.error("Enter another email this is alreaddy regisstered") ;
      }
      else if(req.status === 400){ // yha error hai
         toast.error("Invalid email try again") ;
      }
      else if(req.status === 404){
         toast.error("User not found") ;
      }
      else if(req.status === 429){
         toast.error("Maximum limit reached try again after 24hrs")
      }
      else if(req.status === 403 ){
         toast.error("Please wait 1 minute before trying again")
      }
      else if(req.status === 500){
         toast.error("Internal server error .") ;
      }
      else if(!req.ok){
         toast.error("Something went wrong try again later")     ;
      }
      else{
          sessionStorage.setItem("Email",email) ;
          console.log(purpose) ;
          console.log(email) ;
          navigate(`/otp_verification/${purpose}`) ;
      }
    }
    catch(err){
       setLoading(false) ;
       toast.error("Internal server error try again after some time")  ;
       console.log(err.message) ;
    }
 }

 return(

   <form onSubmit={handle_Submit} className='email_input_form'  style={{ backgroundImage: `url(${bgImg})`, position:"relative", backgroundSize:"cover", backgroundPosition:"center" }}>

      <fieldset className='input_wrappor' disabled ={loading} >

         <div className='headWrappor'>
            <div className='envolop_logo_wrapper'>
              <img src={Envolop} alt="app logo"  className='envolop_logo' />
            </div>
           <h6 className='heading'>Let's get you back in</h6>
           <p className='subheading'>Enter your email address and<br />  we'll send you a otp to your Email</p>
         </div>

         <div className='email_input_wrapper'>

          <span className='EmailAddressText'>Email address</span>
          <div className='email_inputboxWrapper'>
            <IoMdMail className='email_icon' />
            <input
              type="email"
              className='email_input_box'
              placeholder={purpose === "changeEmail" ? "Enter new email" : "Enter email"}
              onChange={(e)=>setEmail(e.target.value)}
              value={email}
              spellCheck={false}
              aria-label='Email input box'
              required
            />
          </div>
         </div>
         <button type='submit' className='email_Submit_btn' aria-label='email submit button'>Submit</button>
      </fieldset>

     {loading && (
        <Spinner></Spinner>
     )}
   </form>
 )
}