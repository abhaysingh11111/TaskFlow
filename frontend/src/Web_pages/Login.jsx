import React,{ useState ,useContext } from 'react';
import './Login.css';
import { Link,useNavigate } from 'react-router-dom';
import app_icon from '../assets/RTI_To_do_app.png';
import { Spinner } from '../Components/Spinner/spinner.jsx';
import { toast } from 'react-toastify';
import { IoMdEyeOff ,IoMdEye} from "react-icons/io";
import loginBg_img from '../assets/loginBg.png';
import { Auth_context } from '../Context/authContext.jsx';

export const Login_page = () => {

   const [userName , setuserName] = useState("") ;
   const [passWord , setpassWord] = useState("") ;
   const navigate = useNavigate() ;
   const [loading  , setLoading] = useState(false) ;
   const [isViewpas , setIsviewPas] = useState(false) ;
   const {logined , setLogined} = useContext(Auth_context) ;

 const showError = (message, id) => {
   toast.error(message, {
      toastId: id
   });
 };

 const showSuccess = (message, id) => {
   toast.success(message, {
      toastId: id
   });
 };

 const handleSubmit = async(e)=>{

   e.preventDefault();
   setLoading(true);

   const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

   if(!usernameRegex.test(userName)){

      setLoading(false);
      console.log("1")
      showError(
         "username syntax error",
         "username-syntax-error"
      );

      return;
   }

   else if(!passwordRegex.test(passWord)){
      console.log("2")

      setLoading(false);

      showError(
         "Invalid password format",
         "invalid-password-format"
      );
      return;
   }
   else{
      try{

         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login/login`,{
            method: "POST",
            credentials : "include",
            headers:{
               "Content-Type" : "application/json"
            },
            body :JSON.stringify({userName,passWord})
         });

         const data = await res.json();

         setLoading(false);

         // unauthorized / direct attack
         if(res.status === 401){

            if(data.message === "unauthorized"){
                     console.log("3")

               showError(
                  "Unauthorized request",
                  "unauthorized-request"
               );
            }

            else if(data.message === "Invalid password"){
               showError(
                  "Wrong password",
                  "wrong-password"
               );
                     console.log("4");

            }

            else{
                     console.log("5")

               showError(
                  "Unauthorized",
                  "unauthorized"
               );
            }
         }

         // user not found
         else if(res.status === 404){
                  console.log("6")

            showError(
               "user does not exist",
               "user-not-found"
            );
         }

         // bad request
         else if(res.status === 400){
            console.log("hii my son ");
            showError(
               data.message || "Something went wrong",
               "bad-request"
            );
         }

         // internal server error
         else if(res.status === 500){
                  console.log("7")

            showError(
               "Internal server error try again after some time",
               "internal-server-error"
            );
         }
         // any other error
         else if(!res.ok){
                        console.log("hii my son isnot respomsive");

            showError(
               "something went wrong try again",
               "something-wrong"
            );
         }

         // success
         else{
            showSuccess(
               "Logged in successfully",
               "login-success"
            );
            setLogined(true);
            navigate('/destination_page');
         }

      }

      catch(err){
         setLoading(false);
         console.log(err.message);
         showError(
            "Internal server error try again after some time",
            "catch-server-error"
         );
      }
    }
  }

 return (

  <form className='loginFormBody'  onSubmit={handleSubmit} aria-label='loginForm'style={{backgroundImage: `url(${loginBg_img})` , backgroundSize: "cover" , backgroundPosition: "center"}}>
   <fieldset disabled ={loading} className='login_form_wrapper'>
        <img src={app_icon} alt="app logo" className='app_icon'/>
      <div className='loginFormMsg_Wrapper'><div className='headWrapper'><h2 className='loginFormLeftHead'>Welcome</h2> <h2 className='loginFormRightHead'> Back 👋</h2></div><span className='loginForm_subtext'>Continue your productivity journey</span></div>
     <div className='passwordandusernamewrapper'>
       <input type="text"placeholder='Enter your Username' required   onChange={(e)=>setuserName(e.target.value)} value={userName} spellCheck={false} aria-label='username input box' className='usernameInput'/>
       <div className='passwordWrapper'>
          <input type= {isViewpas ?"text":"password"} placeholder='Enter your password' onChange={(e)=>setpassWord(e.target.value)} required value={passWord} aria-label='password input box' className='passwordInput'/>
         {isViewpas
            ?(
               <IoMdEye onClick={()=>setIsviewPas(false)} aria-label='hide password button' className='openEye'/>
            )
            :(
               <IoMdEyeOff onClick={()=>setIsviewPas(true)} aria-label='show password button' className='closeEye'/>
            )
         }
       </div>
     </div>

      <button type='submit'className='loginBtn' aria-label='login form submit button'>Login</button>

      {loading &&(
        <Spinner/>
      )}

    <div className='redirect_and_google_wrapper'>
      <div className='dont_have_acc_wrapper'>
         <h2 className='dont_have_acc_text'>don't have an account?</h2>
         <Link to ="/Sign_up" aria-label='navigate to signup page'  style={{pointerEvents: loading ? "none" : "auto",opacity: loading ? 0.5 : 1,cursor: loading ? "not-allowed" : "pointer"}} className='loginSignup_formNavigationLink'>Signup</Link>
      </div>

        <Link to="/forget_Password/forgetPassword" aria-label='navigate to forget password page' className='forgetPassword_navigationLink'  style={{pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.5 : 1,cursor: loading ? "not-allowed" : "pointer"}}>Forget password</Link>
     </div>
    </fieldset>
  </form>
 )
}