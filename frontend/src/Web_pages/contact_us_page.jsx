import React from 'react'
import './contact_us_page.css'
import { motion } from "framer-motion";

export const Contact_page = () => {

  return (
    <div className='Contact_wrappor'>
        <motion.div
          initial ={{opacity:0  ,scale:0.4}}
          whileInView={{opacity:1 ,scale:0.6}}
          viewport={{once:true}}
          transition={{duration:1.5}}
          className='motion_wrappor'
        >
         <h2 className='contact_head'>Contact us</h2>
        <div className='mail_box'>
          <h2 className='mailHead'>Mail on : </h2>
          <h3 className='mail'>r05451747@gmail.com</h3>
        </div>
        <div className='contact_number_box'>
          <h2 className='contactHead'>Contact no :</h2>
          <h3 className='contactNumber'>8843323232</h3>
        </div>
       </motion.div>
    </div>
  )
}
