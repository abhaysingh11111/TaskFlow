import './Main_footer.css'
import {Link} from 'react-router-dom'
import app_icn from '../../assets/RTI_To_do_app.png'

const footer = ()=>{

    const  yt_Navigator =()=>{
        window.open('https://www.youtube.com/@TaskFlow123')
    }
    const  insta_Navigator =()=>{
        window.open('https://www.instagram.com/dd1125956/')
    }
    const  fb_Navigator =()=>{
        window.open()
    }
    const Home_navigator =()=>{
       window.open('/')
    }

  return(

   <div className='Footer_wrappor'>
     <div className='top_footer'>
        <img src= {app_icn} alt="server error" className='app_logo' onClick={Home_navigator}/>
        <h2 className='head_top'>Task Flow</h2>
     </div>
     <div className='middle_wrappor'>
        <div className='middle1'>
          <span className='head1'> Who are we</span>
          <Link className='link1' to='about'>About us</Link>
        </div>
        <div className='middle2'>
            <span className='head2'>Use Task Flow</span>
          <Link className='link2' to='/'>Task Flow Web</Link>
        </div>
        <div className='middle3'>

          <span className='head3'>Need Help</span>
            <Link className='link3'to='contact'>Contact us</Link>
        </div>
     </div>

     <div className='bottom_footer'>
       <Link className='terms_privacy_link' to="policy_page" >Terms and privacy policy</Link>
       <span className='yt_icn_box' onClick={yt_Navigator}>   <i className="fa-brands fa-youtube" id='yt_icn' style= {{color: "rgb(255, 0, 0)"}}></i></span>
       <span className='insta_icn_box'  onClick={insta_Navigator}><i className="fa-brands fa-instagram" id='insta_icn' style={{color: "rgb(187, 40, 207)"}}></i></span>
       <span className='fb_icn_box'  onClick={fb_Navigator}>   <i className="fa-brands fa-facebook"  id='fb_icn'style={{color: "rgb(40, 89, 207)"}}></i></span>
     </div>
   </div>
    )
}
export default footer ;