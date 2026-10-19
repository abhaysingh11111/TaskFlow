import React, { useState ,useEffect , useRef, useContext, useCallback} from 'react' ;
import './destination_page.css' ;
import { useNavigate } from "react-router-dom";
import App_logo from '../assets/RTI_To_do_app.png';
import TaskFlow_bg_img from '../assets/taskflow_bg_img.png';
import Mic_open from '../assets/microphone.png';
import { Auth_context } from '../Context/authContext';
import { Spinner } from '../Components/Spinner/spinner';
import { lang_Context } from '../Context/lang_Context';
import { toast } from 'react-toastify';
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { MdCancel } from "react-icons/md";
import { DashboardContext } from '../Context/dashboardRefresh_Context';

export const Destination_page = () => {

   const [open_Micshow , set_Open_micshow] = useState(false) ;
   const [tasks , setTasks] = useState([]) ;
   const [task , setTask] = useState("") ;
   const recognitionRef = useRef(null);
   const SILENCE_LIMIT  = 2000 ;
   const silence_Timer_ref = useRef(null) ;
   const {logined,authLoading} = useContext(Auth_context) ;
   const {lang} = useContext(lang_Context) ;
   const [loading , setLoading] = useState(false) ;
   const [bottomLoading , setBottomloading] = useState(false) ;
   const navigate = useNavigate() ;
   const [is_Submited , set_Is_submited] = useState(false) ;
   const abort_Controller_ref = useRef(null)  ;
   const loadingRef =  useRef(false);
   const hashmoreRef = useRef(true) ;
   const [page , setPage] = useState(1) ;
   const limit = 10 ;
   const [hasMore , setHasmore] = useState(true) ;
   const [editingId, setEditingId] = useState(null);
   const [edit_Txt , set_Edit_txt] = useState("") ;
   const observer_Element_ref = useRef(null);
   const [prevTxt , setprevTxt] = useState("") ;
   const {refreshKey ,setRefreshKey} = useContext(DashboardContext) ;
   /* ================= TOAST HELPERS ================= */

   const showError = (msg) => {
      toast.error(msg, {
         toastId: msg
      });
   };

   const showSuccess = (msg) => {
      toast.success(msg, {
         toastId: msg
      });
   };

   /* VOICE TO TEXT  */
   useEffect(()=>{

      const speechRecognization = window.SpeechRecognition || window.webkitSpeechRecognition ;

      if(!speechRecognization){
        showError("Voice input is not supported on this browser");
        return ;
      }

     const recognition = new speechRecognization() ;

     recognition.continuous = true ;
     recognition.interimResults = true;
     recognition.lang = "en-US";

     recognitionRef.current = recognition ;

      const reset_Timer = () =>{

          clearTimeout(silence_Timer_ref.current) ;

          silence_Timer_ref.current = setTimeout(()=>
           {
            recognition.stop() ;
            set_Open_micshow(false) ;
           },SILENCE_LIMIT
        ) ;
      }

       recognition.onstart = ()=>{
          reset_Timer() ;
       }

     recognition.onresult = (event) => {
         const result = event.results[event.results.length - 1];
         const transcript = result[0].transcript;

         console.log("User said:", transcript);

         setTask(transcript);
         reset_Timer() ;
     } ;

      recognition.onerror = (err) => {

        console.log(err.message);

        if(err.error === "not-allowed"){

           showError("Mic permission denied ❌")
        }
        else {
          showError("Mic error: " + err.message);
          set_Open_micshow(false);
        }
      };

      abort_Controller_ref.current = new AbortController() ;

        return () => {

          recognition.stop();
          clearTimeout(silence_Timer_ref.current);
        };

      },[logined]);

  useEffect(()=>{
   if(authLoading===true) return;
    if(logined){
     const twenty4_hrs_pending_task = async() =>{

         setLoading(true) ;

         try{

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_24hrs_History`,
                {
                  method:'POST',
                  credentials:"include",
                  headers:{
                     "Content-Type" : "application/json"
                  },
                  body:JSON.stringify({page , limit})
                }
            );

            const parse = await res.json() ;

            setLoading(false) ;

            if(res.status === 400){

               showError("Something went wrong try again letter") ;
            }
            else if(res.status === 200 && parse.chunk.length === 0){

               setHasmore(false) ;
               console.log("component mountedd successfully") ;
            }
            else if(res.status === 500){

              console.log("else if body error") ;

              showError("Internal server error hai from 24hrs task") ;
            }
            else if(res.status === 401){

              showError("Session expired");

              navigate('/Log_in') ;

            }
            else if(res.status === 403){

              showError("Something went wrong...");

              navigate('/Log_in') ;
            }
            else if(!res.ok){

              showError("Internal server error try again after some time from 24hrs") ;
            }
            else{

              setTasks(prev =>[...prev,...parse.chunk])  ;

              if(page === parse.total_Pages){

                 setHasmore(false) ;
              }
            }
         }
         catch(err){

            setLoading(false) ;

            console.log(err.message) ;

            showError("Internal server error try again letter from catch block") ;
         }
       }

        twenty4_hrs_pending_task();
      }
      else{

        navigate('/Log_in') ;
      }

   },[page ,logined]) ;

    useEffect(() => {

      if (recognitionRef.current) {

        const langMap = {
           en: "en-US",
           hi: "hi-IN"
        };

       recognitionRef.current.lang = langMap[lang] || "en-US";
     }

    }, [lang]);

      const start_Listening = ()=>{

        if (!recognitionRef.current) return;

        recognitionRef.current.start() ;
      }

      const stop_Listening = () =>{

          if (!recognitionRef.current) return;

          clearTimeout(silence_Timer_ref.current);

          recognitionRef.current.stop() ;
      }

     useEffect(() => {

        loadingRef.current = loading;
        hashmoreRef.current = hasMore;

     }, [loading, hasMore]);

   const handle_Observer = useCallback((entries)=>{

      const entry = entries[0] ;

       if (loadingRef.current || !hashmoreRef.current){
         return  ;
       }

       if(entry.isIntersecting){

          setLoading(true) ;

          setPage(prev =>prev+1) ;
       }

   },[]) ;

  useEffect(()=>{

     const observer = new IntersectionObserver(handle_Observer) ;

     const current = observer_Element_ref.current;

     if (current) observer.observe(current);

     return () => {

      if(current){
        observer.unobserve(current);
      }

      observer.disconnect();
     }

  },[]) ;

 function responses_Handler (req , task_Data){

        setLoading(false) ;

         if(req.status === 400){

            showError("Invalid request, please check your input and try again.")
         }
         else if(req.status === 401){

            showError("Session expired reLogin and try again");

            navigate('/Log_in') ;
         }
         else if(req.status === 403){

            showError("Authentication failed");

            navigate('/Log_in') ;
         }
         else if(req.status === 500){

            showError("Internal server error from inside res handleer")
         }
         else if(!req.ok){

              showError("Something went wrong try again letter")
         }
         else{

            showSuccess("Task added successfully") ;

            setRefreshKey(prev => prev + 1) ;

            const task= task_Data.task_Obj ;

            setTasks(prevTask=>[task,...prevTask]) ;
         }
 }

   const Handle_task_submit = async() =>{

        setLoading(true) ;

        const task_Regex = /^[\p{L}\p{N}\p{P}\p{Zs}]{3,100}$/u;

      if(!task_Regex.test(task)){

           setLoading(false) ;

           showError("Task must be 3-100 characters long") ;

           return ;
      }

     else{

       try{

           const req= await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_Add`,
              {
               method:"POST",
               credentials:"include",
               headers:{
                  "Content-Type" : "application/json"
               } ,
               body: JSON.stringify({task})
              }
           ) ;

          const task_Data = await req.json() ;

          responses_Handler(req , task_Data) ;
      }

         catch(err){

            setLoading(false) ;

            showError("Something went wrong try again letter") ;

            return ;
         }
      }
   }

const handle_Task_completed = async(task_Id) =>{

  try{

     const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_Complete`,{

        method:"POST" ,
        credentials:"include",
        headers:{
         "Content-Type" : "application/json"
        },
        body:JSON.stringify({task_Id})
     })

    console.log("inside") ;

   if(req.status === 401 || req.status === 403){

     showError("Session expired. Please login again.") ;

     navigate("/login") ;
   }
   else if(req.status === 404 ){

      showError("Something wrong please try again letter") ;
   }
   else if(req.status === 500 ){

      showError("Internal server error") ;

      console.log("500 frontend error") ;
   }
   else if(!req.ok){

      showError("Something went wrong..") ;
   }
   else{

     showSuccess("Nice! Task completed successfully 🎉") ;

     setRefreshKey(prev => prev + 1) ;

     setTasks(prev => prev.filter(t => t._id !== task_Id));

     setEditingId(null);
   }
  }
  catch(err){

    console.log(err.message) ;

    showError("Internal server error inside complete") ;
  }
}

 const handle_Task_deletion = async(task_Id) =>{

   try{

      const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_Del`,{

         method:"DELETE" ,
         credentials:"include",
         headers:{
           "Content-Type" : "application/json"
         },
         body:JSON.stringify({task_Id})
      }) ;

      setLoading(false) ;

    if(req.status === 401 || req.status === 403){
      showError("Session expired. Please login again.") ;
      navigate("/login") ;
    }
    else if(req.status === 404){
       showError("user not found") ;
    }
    else if(req.status == 500){
      showError("Internal server error") ;
    }
    else{
       showSuccess("Task deleted successfully") ;
       setTasks(prev => prev.filter(t => t._id !== task_Id));
        setEditingId(null);
        setRefreshKey(prev => prev + 1);
    }
  }
  catch(err){

    console.log(err.message) ;

    showError("Internal server error") ;
  }
 }

 const handle_Task_edit_Cancelation = async(task_Id) =>{

   try{

     if(is_Submited === false){
        return ;
     }

     const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_edit_cancel`,{

        method:"POST" ,
        credentials:"include",
        headers:{
           "Content-Type" : "application/json"
        },
        body:JSON.stringify({task_Id}),

        signal: abort_Controller_ref.current.signal
     }) ;

     const parse_Data = await req.json() ;

     abort_Controller_ref.current = new AbortController();

     setLoading(false) ;

      if(req.status === 403 && parse_Data.purpose == "blocked_Task-id"){

         showError("Sorry try again letter.") ;
      }

      if(req.status === 401 || req.status === 403){

        showError("Session expired. Please login again.") ;

        navigate("/login") ;
      }
      else if(req.status === 404){

        showError("Something went wrong try again later") ;
      }
      else if(req.status === 500){

          showError("Internal server error from task del") ;
      }
      else if(!req.ok){

         showError("Something went wrong try again letter") ;
      }
      else{

          showError("task edit canceled") ;

          setTasks(prev => [...prev]);
      }
  }
  catch(err){

    setLoading(false) ;

    console.log(err.message) ;

    showError("Internal server error try again after some time from task del") ;
  }
 }

 const Edit_handle_func = async(task_Id , task) =>{

      set_Is_submited(true) ;

      setLoading(true) ;

      const task_Regex = /^[\p{L}\p{N}\p{P}\p{Zs}]{3,100}$/u;

      if(!task_Regex.test(task)){

           setLoading(false) ;

           set_Is_submited(false) ;

           showError("Task must be 3-100 characters long") ;

           return ;
      }

     if(prevTxt.trim() === task.trim() ){

        showError("submit after some change") ;

        setLoading(false) ;

        set_Is_submited(false) ;

        return ;
     }

   try{

     const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_Edit`,{

        method:"PATCH" ,
        credentials:"include",
        headers:{
          "Content-Type" : "application/json"
        },
        body:JSON.stringify({task_Id,task})
     }) ;

    set_Is_submited(false) ;
    setLoading(false) ;
    setEditingId(null) ;

    const parse_Data = await req.json() ;

   if(req.status === 401 || req.status === 403){
     showError("Session expired. Please login again.") ;
     navigate("/login") ;
   }
   else if(req.status === 404){
     showError("user not found") ;
   }
   else if(req.status == 500){
     showError("Internal server error") ;
   }
   else{
     showSuccess("Task updated successfully") ;
     setTasks(prev => prev.map(t => t._id === editingId ? { ...t, task }:t));
   }
  }
  catch(err){

     console.log(err.message) ;
     setLoading(false) ;
     showError("Internal server error try again letter") ;
  }
}

 return (

   <form
      className='wrappor'
      style={{ backgroundImage: `url(${TaskFlow_bg_img})` }}
   >
      <fieldset disabled={loading} className='box'>

         {!logined && (
            <Spinner />
         )}

         {logined && (
           <>
               <img
                  src={App_logo}
                  alt="Server error"
                  className='app_logoooo'
               />

               <div className='task_input_wrappor'>

                  <input
                     type="text"
                     className='task_input_box'
                     onChange={(e) => setTask(e.target.value)}
                     value={task}
                     placeholder="Enter  your  task.."
                  />

                  {!open_Micshow && (
                     <span
                        className='mic_wrappor'
                        onClick={() => {
                           start_Listening();
                           set_Open_micshow(true);
                        }}
                     >
                        <i
                           className="fa-solid fa-microphone"
                           id='mic'
                        ></i>
                     </span>
                  )}

                  {open_Micshow && (
                     <img
                        src={Mic_open}
                        id="mic_open_icon"
                        onClick={() => {
                           set_Open_micshow(false);
                           stop_Listening();
                        }}
                        alt="mic active"
                     />
                  )}

                  {task.trim().length > 0 && (
                     <button
                        className='task_adder_btn_wrappor'
                        onClick={Handle_task_submit}
                        type="button"
                     >
                        <i
                           className="fa-solid fa-paper-plane"
                           style={{ color: "rgb(40, 89, 207)" }}
                           id='task_adder_btn'
                        ></i>
                     </button>
                  )}

               </div>

               {loading && (
                  <Spinner />
               )}

               {tasks.map((taskObj) => {

                  const is_Editing = editingId === taskObj._id;

                  return (

                     <div
                        className='task_Wrappor'
                        key={taskObj._id}
                     >

                        <div className='task_left_wrappor'>

                           <div className='title_and_status_wrappor'>

                              {!is_Editing && (
                                 <h2>{taskObj.task}</h2>
                              )}

                              {is_Editing && (
                                 <input
                                    type="text"
                                    value={edit_Txt}
                                    onChange={(e) =>
                                       set_Edit_txt(e.target.value)
                                    }
                                 />
                              )}

                              <h3>{taskObj.status}</h3>

                           </div>

                           {/* edit btn */}

                           <div
                              onClick={() => {
                                 setEditingId(taskObj._id);
                                 setprevTxt(taskObj.task);
                                 set_Edit_txt(taskObj.task);
                              }}
                           >
                              <i
                                 className="fa-solid fa-pen"
                                 style={{ color: "rgb(249, 110, 226)" }}
                              ></i>
                           </div>

                        </div>

                        <div className='task_right_wrappor'>

                           {!is_Editing && (
                              <>

                                 <button
                                    onClick={() =>
                                       handle_Task_completed(taskObj._id)
                                    }
                                    className='compl_btn'
                                    type='button'
                                 >
                                    <h2>Completed</h2>

                                    <i
                                       className="fa-solid fa-check"
                                       style={{ color: "rgb(67, 214, 94)" }}
                                    ></i>
                                 </button>

                                 <button
                                    onClick={() =>
                                       handle_Task_deletion(taskObj._id)
                                    }
                                    className='rem_btn'
                                    type='button'
                                 >
                                    <h2>Remove</h2>
                                    <span><MdCancel /></span>
                                 </button>
                              </>
                           )}

                           {is_Editing && (
                              <>

                                 <fieldset disabled={is_Submited}>

                                    <button
                                       onClick={() =>
                                          Edit_handle_func(
                                             taskObj._id,
                                             edit_Txt
                                          )
                                       }
                                       type='button'
                                       id='saveButton'
                                    >
                                       <h2>Save</h2>

                                       <span>
                                          <TbRosetteDiscountCheckFilled />
                                       </span>

                                    </button>

                                 </fieldset>

<button
   onClick={() => {
      handle_Task_edit_Cancelation(taskObj._id);
      abort_Controller_ref.current.abort();
      setEditingId(null);
   }}
   id="cancel_Btn"
   type="button"
>
   <h2>Cancel</h2>

   <span>
      <MdCancel />
   </span>
</button>


                              </>
                           )}

                        </div>

                     </div>
                  );
               })}

               {/* observer element */}

               <div
                  className='last_Observing_element'
                  ref={observer_Element_ref}
               ></div>

            </>
         )}

         {bottomLoading && (
            <Spinner />
         )}

      </fieldset>
   </form>
)
}