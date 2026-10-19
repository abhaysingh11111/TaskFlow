import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './profilePage.css';
import { toast } from 'react-toastify';
import { Spinner } from '../Components/Spinner/spinner.jsx';
import { FaPencilAlt } from "react-icons/fa";
import { Auth_context } from '../Context/authContext';

// img size in frontend alsoin  backend all img checks

export const ProfilePage = () => {

  const [profileImg, setProfileImg] = useState(
    "https://tse4.mm.bing.net/th/id/OIP.hGSCbXlcOjL_9mmzerqAbQHaHa?pid=Api&P=0&h=180"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [showRetry, setShowretry] = useState(false);
  const [editable, setEditable] = useState(true);
  const {logined , setLogined} = useContext(Auth_context) ;

  // common errors functions which errors can comes at mant funcs
  const commonError = (req) => {

    let errMsg = "" ;

    if(req.status === 401 ||req.status === 404 ||req.status === 400) {
      errMsg = "Unauthenticated" ;
      toast.error(errMsg , {
         toastId : errMsg
      })
      console.log(req.status) ;
      setLoading(false) ;
      navigate(`/Log_in`);
    }
    if(errMsg !== ""){ // means there is navigation happened and fruther code should be stop exicutung
        return true ;
    }
    return false;
  };

  // fetch profile data
  useEffect(() => {

    const InitialProfileDataFetch = async () => {
       let errorMsg = "";
       setShowretry(false);

      try{
        const req = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/account-API/profileRoutes/getProfileData`,
          {
            credentials: "include"
          }
        );

        const parseData = await req.json();
        setLoading(false);
        let commonErrRes = commonError(req)

        if(commonErrRes === true){
           return ;
        }
        else if(req.status === 500 || !req.ok) {
          errorMsg = "Internal server error try again later";
          toast.error(errorMsg, {
            toastId: errorMsg
          });
          setShowretry(true);
        }
        else{
         setEmail(parseData.data.email);
setFullName(parseData.data.fullName);
setProfileImg(parseData.data.profileImg);
        }
      }
      catch(err) {
        setLoading(false);
        errorMsg = "Internal server error try again";
        toast.error(errorMsg, {
          toastId: errorMsg
        });
        setShowretry(true);
      }
    };

    InitialProfileDataFetch();
  },[retry]);

  // logout
  const handleLogout = async () => {
     let errMsg = "";

    try {
      const res =await fetch(`${import.meta.env.VITE_API_BASE_URL}/account-API/logOut/logOut`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      setLoading(false);
      let common_res = commonError(res);

      if(common_res === true){
        return ;
      }
      else if(!res.ok){
        errMsg = "Failed to log out. Please try again.";
        toast.error(errMsg, {
          toastId: errMsg
        });
        return;
      }
      else {
        setLogined(false) ;
        errMsg = "Logged out successfully.";
        toast.success(errMsg, {
          toastId: errMsg
        });
        navigate("/Log_in");
        return ;
      }
    }
    catch (err) {
      setLoading(false);
      errMsg = "Internal server error try again after some time";
      toast.error(errMsg, {
        toastId: errMsg
      });
      console.log(err.message);
    }
  };

  // profile image change
  const handleProfileImgChange = async (e) => {
     const file = e.target.files[0];
     const MaxFileSiize = 1024 * 1024 * 2 ;  let errMsg = "";

    if (!file) {
      return;
    }

    if(file.size  > MaxFileSiize){
      errMsg = "Maximum file size can be 2MB" ;
      toast.error(errMsg,{
        toastId : errMsg
      }) ;
      return ;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
    ];

    // check uploaded doc format
    // now returrn with error
    if(!allowedTypes.includes(file.type)) {
       errMsg = "This selected type is invalid" ;
       toast.error(errMsg , {
         toastId : errMsg
       })
       return ;
    }

    setLoading(true);
    if(profileImg.startsWith("blob:")){
       URL.revokeObjectURL(profileImg);
    }
    const imgUrl = URL.createObjectURL(file);

    try {
      const formData = new FormData();
      formData.append("profileImg", file);

      const req = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/account-API/profileRoutes/profileImg_Change`,
          {
            method: "POST",
            credentials: "include",
            body: formData
          }
      );
      setLoading(false) ;
      let common_res = commonError(req); setLoading(false);

      if(common_res === true){
        return ;
      }

      // here we will be check is img size and type of img
      else if(req.status === 400){
        errMsg = "Something went wrong try again"
        toast.error(errMsg , {
          toastId : errMsg
        })
        return ;
      }
      else if(!req.ok) {
        errMsg = "Something went wrong try again";
        toast.error(errMsg, {
          toastId: errMsg
        });
        return;
      }
      else {
        setProfileImg(imgUrl);
      }
    }
    catch (err) {
      errMsg = "Something went wrong try again";
      setLoading(false);
      toast.error(errMsg, {
        toastId: errMsg
      });
    }
  };

 // profile name change
 const handleProfileNameChange = async () => {

    let errMsg = "";
    setLoading(true);
    const fullNameRegex =/^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

    if(!fullNameRegex.test(fullName)) {
      setLoading(false);
      errMsg = "Invalid Fullname";
      toast.error(errMsg, {
        toastId: errMsg
      });
      return;
    }
   else{
    try{
      const req = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/account-API/profileRoutes/profileName_Change`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            fullName: fullName
          })
        }
      );

      setLoading(false);
      console.log(req.status)  ;
      let common_res = commonError(req);

      if(common_res === true){
        return ;
      }
      else if(req.status === 401 || req.status === 400){
        errMsg = "Something went wrong" ;
        toast.error(errMsg , {
           toastId : errMsg
        }) ;
      }
      else if(req.status === 500 || !req.ok){
        errMsg = "Internal server error try again later" ;
        toast.error(errMsg , {
           toastId : errMsg
        })
      }
      else{
        errMsg = "Profile name updated successfully";
        toast.success(errMsg, {
          toastId: errMsg
        });
        setEditable(true);
      }
    }
    catch(err) {
      setLoading(false);
      errMsg = "Internal server error try again";
      toast.error(errMsg, {
        toastId: errMsg
      });
    }
   }
  };

 useEffect(()=>{
   // agar koi url ho use invoke kar
   return () =>{
      URL.revokeObjectURL(profileImg);
   }
 },[])

  return (
    <form className='profilePage'>
      <fieldset className='profileFieldset' disabled={loading}>

        {loading && (
           <Spinner />
        )}

        {!showRetry
            ?(
              <>
                <div className='profileImage_inputWrapper'>
                  <img
                    src={profileImg}
                    alt="Profile Image"
                    className='profileImg'
                  />
                  <input
                    type="file"
                    className='profileImage_input'
                    onChange={handleProfileImgChange}
                    accept='image/png,image/jpeg,image/jpg'
                  />
                </div>

                <div>
                  <div className='nameWrapper'>
                    <h2 id='nameHeading'>Name :</h2>
                    <div className='ProfileNameInputeditWrapper'>

                      <div className='profName_Input_editWrapper'>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          readOnly={editable}
                        />
                        <button
                          type='button'
                          onClick={() => setEditable(false)}
                          className='profileNameeditBtn'
                        >
                          <i className="fa-solid fa-pencil" style={{color: "rgb(72, 75, 160)"}}></i>
                        </button>
                      </div>

                      <div className='editedProfNameWrapper'>
                       {!editable && (
                          <button
                            type='button'
                            onClick={handleProfileNameChange}
                          >
                            Save
                          </button>
                       )}
                      </div>
                    </div>
                  </div>

                  <div className='emailWrapper'>
                    <h2 id='Emailheading'>Email : </h2>
                    <h2>{email}</h2>
                  </div>

                  <button
                    type='button'
                    className='logoutButton'
                    onClick={() => {
                      setLoading(true);
                      handleLogout();
                    }}
                  >
                    Log out
                  </button>

                </div>
              </>
            )
            :(
              <button
                type='button'
                onClick={() => {
                  setRetry((prev) => prev + 1);
                  setLoading(true);
                }}
              >
                Retry
              </button>
            )
        }
      </fieldset>
    </form>
  );
};