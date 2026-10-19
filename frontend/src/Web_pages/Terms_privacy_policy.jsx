import React from 'react'
import './Terms-privacy_policy.css'
import desktop_size_policy from '../assets/terms_policy_desktop.jpg'
import mobile_size_policy from '../assets/terms_policy_mobile.png'

export const Terms_privacy_policy_page = () => {

  return (

    <div className='policy_wrappor'>
        <picture>
           <source  srcSet= {mobile_size_policy} alt ="server error"  media="(max-width: 750px)"/>
           <img src={desktop_size_policy} alt="server error"className='policy_img' />
        </picture>
    </div>
  )

}
