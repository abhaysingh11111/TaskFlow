import taskflow_left_img from "../assets/otp_page_taskflow_left_img.png";
import { Spinner } from "../Components/Spinner/spinner";
import "./otp_verification_page.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Auth_context } from "../Context/authContext";
import { useEffect, useRef, useState, useContext } from "react";

const Otp_verific_page = () => {

  const email = sessionStorage.getItem("Email"); // email extract
  const [loading, setLoading] = useState(false);
  const [otps, setOtps] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const { purpose } = useParams();
  const navigate = useNavigate();
  const { setLogined } = useContext(Auth_context);

  /* Step 1️⃣ ek flag banaya jo batayega ki page refresh ho raha hai ya nahi
  default value false hai (matlab refresh nahi ho raha)*/
  const isReload = useRef(false);

  // reusable error toast
  const showError = (message, id) => {
    toast.error(message, {
      toastId: id,
    });
  };

   console.log("email =", email);
   console.log("purpose =", purpose);

  // reusable success toast
  const showSuccess = (message, id) => {
    toast.success(message, {
      toastId: id,
    });
  };

  useEffect(() => {
    if (purpose === "deleteAccount" || purpose === "changeEmail") {
      showSuccess(`otp sent successfully to : ${email}`, "otp-send-delacc");
    }
  }, [purpose, email]);

  useEffect(() => {

    /* Step 2️⃣
    ye function tab chalega jab browser page ko reload / refresh karne wala hoga*/
    const handleUnload = () => {

      // agar refresh hone wala hai
      // to flag ko true kar do
      isReload.current = true;
    };

    // Step 3️⃣
    // browser ke "beforeunload" event ko listen kar rahe hain
    // ye event tab fire hota hai jab:
    // - page refresh ho
    // - tab close ho
    // - page leave ho

    window.addEventListener("beforeunload", handleUnload);

    // Step 4️⃣
    // ye cleanup function hai
    // ye tab run hota hai jab component unmount hota hai
    // matlab user kisi dusre page pe navigate karta hai

    return () => {

      // pehle event listener remove kar dete hain
      // taaki memory leak na ho

      window.removeEventListener("beforeunload", handleUnload);

      // Step 5️⃣
      // agar page refresh nahi ho raha tha
      // matlab user kisi dusre page pe gaya hai

      if (!isReload.current) {

        // to sessionStorage se email delete kar do
        sessionStorage.removeItem("Email");
      }
    };
  }, []);

  const Handle_submit = async (e) => {

     e.preventDefault();
     setLoading(true);

    try {
      const otp = otps.join("").trim(); // join the user otp
      console.log(otp) ;
      if (!/^\d{6}$/.test(otp)) {
        setLoading(false);
        showError("Invalid OTP format", "invalid-otp-format");
        return;
      }
      else if (!email) {
        setLoading(false);
        showError("email is missing", "email-missing");
        return;
      }
      else{
        let routeAddress = ""; let apiType ="account-API"; let routeWrapperAddress ;

        if(purpose === "changeEmailForgetPassword") { // change email  floe forget pas otp verification
           routeAddress = "changeEmailforgetPassword";
           routeWrapperAddress = "changeEmail"
        }
        else if(purpose === "deleteAccountForgetPassword") { // del account flow forget password otp verific
           routeAddress = "deleteAccountforgetPassword";
           routeWrapperAddress = "deleteAccount"
        }
        else if(purpose === "forgetPasswordforChangepassword"){
           routeAddress = "forgetPasswordforChangepassword";
           routeWrapperAddress = "changePassword"
        }
        else if(purpose === "changePassword"){
           routeAddress = purpose ;
           routeWrapperAddress = purpose;
        }
        else if(purpose === "deleteAccount"){  // delete Account otp compare
           routeAddress = purpose ;
           routeWrapperAddress = purpose;
        }
        else if(purpose === "signup"){
           routeAddress = purpose;
           apiType = "api"
           routeWrapperAddress = purpose;
        }
        else{
           routeAddress = "forgetPassword"
           apiType = "api"
           routeWrapperAddress = "forgetPassword"
        }

        try{
          console.log("otp compare req sending") ;
          const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${apiType}/${routeWrapperAddress}/${routeAddress}/otpCompare`, {
             method: "POST",
             credentials: "include",
             headers: {
               "Content-Type": "application/json",
             },
             body: JSON.stringify({ email: email, otp: otp }),
          });

          console.log("otp compare req sent") ;
          console.log(req.status) ;
          const data = await req.json(); //now parse the return body
          setLoading(false);
          console.log(req.status) ;

          if(req.status === 429) {
            showError("Max compare limit reached try again after 24 hours", "max-limit");
          }
          else if (data.purpose === "changeEmail" && req.status === 400) {
            showError("Somethdding went wrong", "change-email-error");
          }
          else if (req.status === 401 && data.purpose === "deleteAccount and changeEmail") {
            showError("Unauthorized", "unauthorized");
          }
          else if (req.status === 404) {
            showError("Session expired", "session-expired");
          }
          else if (req.status === 400) {
            showError("Otp expired", "otp-expired");
          }
          else if (req.status === 401) {
            showError("Invalid otp", "invalid-otp");
          }
          else if (!req.ok) {
            showError("Something went wrong .", "something-wrong");
          }
          else {
            console.log("inside of else email del") ;
            sessionStorage.removeItem("Email");

            if(req.status === 200 && data.purpose === "changeEmail") { // mujhe ise destination page me bhej dena tha
              showSuccess("Email updated successfully", "email-updated");
              navigate("/destination_page");
              return;
            }
            if(req.status === 200 && data.purpose === "deleteAccount") {
              showSuccess("Account deleted successfully", "account-deleted");
              setLogined(false) ;
              navigate("/Log_in");
              return;
            }

            showSuccess("Otp verified successfully", "otp-verified");

            if(req.status === 201 && data.purpose === "signup") {
              // means otp verified
              setLogined(true);
              // sending to destination page
              navigate(`/destination_page`);
            }
            if(req.status === 200) {
              if(data.purpose === "changeEmailForgetPassword") {
                navigate(`/update_Password/${data.token}?purpose=${data.purpose}`);
                return;
              }
              if(data.purpose === "deleteAccountForgetPassword") {
                navigate(`/update_Password/${data.token}?purpose=${data.purpose}`);
                return;
              }
              if(data.purpose === "forgetPasswordforChangepassword") {
                return  navigate(`/update_Password/${data.token}?purpose=${data.purpose}`);
              }
              if(data.purpose === "forgetPassword") {
                // means otp verified
                // acces these in next page using token name
                console.log("token from otp compare :", data.token) ;
                navigate(`/update_Password/${data.token}`);
              }
            }
          }
        }
        catch (err) {
          setLoading(false);
          console.log(err.message);
          showError("Internal server error try again later", "internal-server-error");
        }
      }
    }

    catch (err) {
      console.log(err.message);
      setLoading(false);
      showError("Internal server error try again later", "outer-internal-server-error");
    }
  };

 // resend otp function
 const resend_Handle_submit = async () => {
    console.log("resend otp function called") ;
    if (!email) {
     showError("Email missing", "email-missing");
     return;
    }

    setLoading(true);

    try {
      console.log("resend otp req sending") ;
      console.log(email)

      // send email to backend
      const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/resendOtp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          purpose
        })
      }) ;

      console.log("resend otp req sent") ;
      console.log(req.status) ;
      console.log(email) ;

      setLoading(false);
      // when user sends but email email is blocked for 24hrs last
      if (req.status === 429) {
         if(req.code === "ACCOUNT_BLOCKED_24H"){
            showError("Maximum attempt try again after 24hrs", "max-attempt");
         }
         else{
           showError("wait a minute", "wait-minute");
         }
      }
      else if (req.status === 400) {
        showError("Email or purpose missing", "email-missing-resend");
      }
      // when email session expired
      else if (req.status === 401) {
        showError("session expired", "resend-session-expired");

        // navigate when user came from sign up resend to sign up page
        if(purpose === "signup") {
          navigate("/Sign_up");
        }
        // when user came from forget password page
        if (purpose === "forgetPassword") {
          navigate("/forget_Password");
        }
      }
      // when there is any unpredictable error
      else if (!req.ok) {
        showError("Something went wrong", "resend-something-wrong");
      }
      // when otp sended successfully
      else{
        showSuccess("OTP sent successfully", "otp-sent");
      }
    }

    catch(err) {
      setLoading(false);
      console.log(err.message);
      showError("Internal server error try again later", "resend-internal-server-error");
    }
  };

  // key based navigation
  const handleKeydown = (e, index) => {

    if (e.key === "Backspace") {

      if (otps[index]) {

        // value hai → sirf clear karo
        const newOtps = [...otps];
        newOtps[index] = "";
        setOtps(newOtps);
      }

      else if (index > 0) {

        // empty hai → piche jao
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index, value) => {

    if (!/^\d?$/.test(value)) return;

    const TempArr = [...otps];
    TempArr[index] = value;
    setOtps(TempArr);

    // mtlab jab value bhi ho and last index pe abhi nhi phuche ho tab next pe focus karo

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (

    <div className="otp_page_container">

      <div className="otp_page_left">
        <img
          src={taskflow_left_img}
          alt="Server_error"
          className="taskflow_left_img"
        />
      </div>

      <form onSubmit={Handle_submit} className="otp_page_right">

        <fieldset className="data_wrapper" disabled={loading}>

          <div className="otp_box_wrapper">

            {otps.map((digit, index) => (
                <input
                  type="text"
                  inputMode="numeric"
                  key={index}
                  onChange={(e) => handleChange(index, e.target.value)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  maxLength={1}
                  onKeyDown={(e) => handleKeydown(e, index)}
                />
              ))
            }
          </div>

          <button
            className="resend_otp_btn"
            onClick={resend_Handle_submit}
            type="button"
          >
            resend otp
          </button>

          <button type="submit" className="otp_submit_btn">
            Verify
          </button>

        </fieldset>

        {
          loading &&
          (
            <Spinner className="spinner"></Spinner>
          )
        }

      </form>
    </div>
  );
};

export default Otp_verific_page;