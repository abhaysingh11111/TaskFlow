import './setting.css' ;
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const SettingPage = () => {

   const [accSettingExpand , setAccSettingExpand] = useState(false) ;

   return (

      <div className='setting_Wrappor'>
         <div className='accountSetting_wrappor'>
            <div className='accountSettinghead'>
              <h2>Account Setting</h2>
              {accSettingExpand
               ? <i className="fa-solid fa-chevron-up" onClick={() => setAccSettingExpand(false)}></i>
               : <i className="fa-solid fa-chevron-down" onClick={() => setAccSettingExpand(true)}></i>
              }
            </div>

            { accSettingExpand &&
               <div className='accountSetting_expand'>
                   <Link to="/inputPassword/deleteAccount">delete Account</Link>
                   <Link to="/inputPassword/changeEmail">Change Email</Link>
                   <Link to="/inputPassword/changePassword">Change Password</Link>
               </div>
            }
         </div>

         <Link to = "/notification">Notifications</Link>
         <Link to ="/contact">Help & Support</Link>
         <Link to ="/About">About</Link>
      </div>
   )
}