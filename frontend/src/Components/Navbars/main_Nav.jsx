import React, { useContext, useState } from 'react'
import To_do_app_icon from '../../assets/RTI_To_do_app.png' ;
import { useNavigate, Link } from "react-router-dom";
import './main_Nav.css' ;
import { Auth_context} from '../../Context/authContext.jsx';
import {lang_Context} from '../../Context/lang_Context.jsx';
import { MdDashboard } from "react-icons/md";

 const Main_navbar = () => {

    const navigate = useNavigate() ;
    const {logined} = useContext(Auth_context);
    const {lang,setLang} = useContext(lang_Context) ;
    const [showCrossbar,setShowcrossBar] = useState(true);

    const Home_page_navigator = () =>{
       navigate('/') ;
    }

  return (
     <nav className='Main_nav_body'>

       <div className='left_nav_wrappor'>
          <div className='app_icon_wrappor' onClick={Home_page_navigator}>
             <img src={To_do_app_icon} alt="server_error" className="app_icen" />
          </div>
            <div className='links'>
              {!logined &&(
                <>
                 <Link to ="/" className='link'>Home</Link>
                 <Link to = "/About" className='link'>About us</Link>
                </>
              )}
              {logined && (
                <>
                 <Link to="/dashboard" className='dashboardWrapper'><h3 className='dashboardLink'>Dashboard</h3> <MdDashboard /></Link>
                 <Link to= "/destination_page" className='taskLink'>Tasks</Link>
                </>
              )}
            </div>

       </div>

       <div className={`right_nav_wrappor ${showCrossbar === false ? "vertical" : ""}`}>
         {!logined
         ?(
             <>
               <Link to="/Log_in" className='login_link'>Login</Link>
               <Link to="/Sign_up" className='sign_up_liink'>Signup</Link>
               <i className="fa-solid fa-bars" style={{ color: "rgb(241, 246, 255)" }} id='hamburger_icn'></i>
             </>
         )
         :(
           <>
             <Link className='historyWrapper' to="/historyPage">
               <h3>History</h3>
               <i className="fas fa-history"></i>
             </Link>
             <Link to="/setting">
               {/* setting icon*/}
               <i className="fa-solid fa-gear" id="setting_icon"style={{color: "rgb(40, 89, 207)"} }></i>
             </Link>

             <Link to="/profilePage">
               {/* profile icon*/}
               <i className="fa-solid fa-circle-user" id ="user_profile_icon"style={{color: "rgb(40, 89, 207)"}}></i>
             </Link>
           </>
         )}

        </div>

<div className="hangburger_wrapper" style={{ display: "none" }} >
    {showCrossbar === true && (
        <i
            className="fa-solid fa-bars"
            style={{ color: "rgb(14, 14, 14)" }}
            onClick={() => setShowcrossBar(false)}
        ></i>
    )}

    {showCrossbar === false && (
        <i
            className="fa-solid fa-x"
            style={{ color: "rgb(148, 144, 138)" }}
            onClick={() => setShowcrossBar(true)}
        ></i>
    )}
</div>

     </nav>
  )
}

export default Main_navbar ;