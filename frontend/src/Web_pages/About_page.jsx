import React from 'react'
import mobile_img from '../assets/task_flow_about_rti_mobile_size.jpg'
import desktop_img from '../assets/task_flow_about_rti_desktop_size.jpg'
import './About_page.css'

export const About_page = () => {

  return (
    <div className='main_wrappor'>

        <picture className='first_page1'>
          <source srcSet={mobile_img} media="(max-width: 750px)"/>
          <img src={desktop_img} alt="server error" className='about_img' />
        </picture>
        <div className='second_page2'>
           <h1 className='head_txt'>TaskFlow – Smart Way to Organize Your Work</h1>
           <h2 className='sub_txt'>TaskFlow is a modern productivity web application <br/>designed to help individuals and teams manage <br/>their daily tasks efficiently , With a clean interface<br/> and powerful task-management tools, TaskFlow allows<br/> users to organize, track, and complete their work without confusion. <br/>The platform focuses on simplicity, speed, and productivity<br/> so users can stay focused on what truly matters.</h2>
        </div>

       <div className='third_page3'>
          <h1 className='head_txt'>Our Mission</h1>
          <h2 className='sub_txt'>Our mission is to simplify productivity by creating  <br/>smart and user-friendly digital tools that help people  <br/>manage their work better. Through TaskFlow, <br/> we aim to reduce chaos in daily workflows and provide a structured way  <br/>for users to plan, organize, and achieve their goals more efficiently.</h2>
       </div>
       <div className='fourth_page4'>
           <h1 className='head_txt'>About RTI – Rashtriya Tech of India</h1>
           <h2 className='sub_txt'>RTI (Rashtriya Tech of India) is a technology-driven development company <br/>focused on building innovative web applications and digital solutions.<br/> Our goal is to create modern platforms that solve real-world problems<br/> and improve productivity through technology. From productivity tools like TaskFlow and Suchna<br/> to future digital products, RTI is committed to delivering reliable, <br/>scalable, and user-friendly software solutions.</h2>
       </div>

    </div>
  )

}
