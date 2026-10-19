import React from 'react'
import Typewriter from 'typewriter-effect'
import video from '../assets/to_do_app_vid.mp4'
import './Main_page.css'
import card1 from '../assets/card1.png'
import card2 from '../assets/card2.png'
import card3 from '../assets/card3.png'
import card4 from '../assets/card4.png'
import { motion } from "framer-motion";

const Main_page = () => {

  return (
    <div className='Main_page_body'>
      <div className='First_page'>
       <div className='first_page_left'>
        <div className='first_page_head'>
           <h1 className='hero_first_head_text'>Organize your day with </h1>
           <span className='task_flow_head_part'>TaskFlow</span>
        </div>
        <h3 className ="typestring_text">
          <Typewriter
            options ={{
                loop : true , deleteSpeed :20 , delay :40 ,
            }}

            onInit = {(Typewriter)=>{
                Typewriter
                 .typeString(`<h3>Plan, track, and complete your daily tasks effortlessly.<br/>
                               Stay organized and make every day productive.
                            </h3>`)
                 .pauseFor(1500)
                 .deleteAll()
                 .start()
            }}
          />
         </h3>
       </div>

       <div className='first_page_right'>
           <video src={video} autoPlay loop muted  aria-label="TaskFlow app preview video"className='videoright'></video>
       </div>
      </div>

      {/*Second page */}
    <div className='cards_wrappor'>
      <div className= "fcard_wrappor">
        <motion.img src={card1}
         alt="smart task planning card"
         className='cardf'
         initial ={{opacity:0 , scale:0.5}}
         whileInView ={{opacity:1 , scale :1}}
         transition={{duration:1}}
         viewport={{ once: true }}
        />
        <motion.img src={card2}
         className='cards'
         alt="see your progress and stay motivated with TaskFlow's visual task tracking and progress indicators."
         initial ={{opacity:0 , scale:0.5}}
         whileInView ={{opacity:1 , scale :1}}
         transition={{duration:1}}
         viewport={{ once: true }}

        />
      </div>

     <div  className= "scard_wrappor">
       <motion.img src={card3}
         className='cardt'
         alt="also can view your tasks in calendar view, making it easier to plan and manage your schedule."
         initial ={{opacity:0 , scale:0.5}}
         whileInView ={{opacity:1 , scale :1}}
         transition={{duration:1}}
         viewport={{ once: true }}
       />
       <motion.img src={card4}
         alt="boost your productivity with TaskFlow's intuitive interface, customizable features, and seamless integration. Stay organized and achieve more every day."
         className='cardfo'
         initial ={{opacity:0 , scale:0.5}}
         whileInView ={{opacity:1 , scale :1}}
         transition={{duration:1}}
         viewport={{ once: true }}
         />
      </div>
    </div>

    </div>
  )
}

export default Main_page ;