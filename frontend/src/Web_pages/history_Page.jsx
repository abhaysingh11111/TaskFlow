import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './history_Page.css';
import { Spinner } from '../Components/Spinner/spinner.jsx';
import { toast } from 'react-toastify';
import { Auth_context } from '../Context/authContext';

export const TaskHistoryPage = () => {

   // refs
   const page = useRef(1);
   const loadingRef = useRef(false);
   // constants
   const limit = 20;

   // states
   const [initialLoading, setInitialloading] = useState(true);
   const [bottomLoading, setBottomloading] = useState(false);
   const [isMore, setIsmore] = useState(true);
   const [tasks, setTasks] = useState([]);
   const [noTaskAval, setNotaskAval] = useState(false);

   // hooks
   const navigate = useNavigate();
   const { setLogined } = useContext(Auth_context);

   const handleScrolling = async () => {

      // stop unnecessary calls
      if (loadingRef.current || !isMore) {
         return;
      }

      // detect bottom
      const isOnbottom =
         window.innerHeight +
         document.documentElement.scrollTop >=
         document.documentElement.scrollHeight - 50;

      // if not initial loading and not on bottom
      if (!initialLoading && !isOnbottom) {
         return;
      }

      // loading lock
      loadingRef.current = true;

      // bottom spinner
      if (isOnbottom && !initialLoading) {
         setBottomloading(true);
      }

      try {

         // backend request
         const req = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/task-API/taskHistory`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json"
               },
               credentials: "include",
               body: JSON.stringify({
                  page: page.current,
                  limit
               })
            }
         );

         const parsedData = await req.json();

         // unauthorized
         if (req.status === 401) {

            toast.error("Unauthorized. Please login again.");

            setLogined(false);

            navigate("/login");

            return;
         }

         // bad request
         if (req.status === 400) {

            toast.error("Invalid request.");

            return;
         }

         // server error
         if (req.status === 500) {

            toast.error("Internal server error.");

            return;
         }

         // other errors
         if (!req.ok) {

            toast.error("Something went wrong.");

            return;
         }

         // no tasks
         if (parsedData.message === "No data found") {

            setNotaskAval(true);

            setIsmore(false);

            return;
         }

         // append tasks
         setTasks((prev) => [
            ...prev,
            ...parsedData.history_Chunk
         ]);

         // move to next page
         page.current += 1;

         // stop further fetching
         if (page.current > parsedData.total_Pages) {
            setIsmore(false);
         }

      }
      catch (err) {

         console.log(err);

         toast.error("Internal server error.");

      }
      finally {

         setInitialloading(false);

         setBottomloading(false);

         loadingRef.current = false;
      }

   }

   // scroll listener
   useEffect(() => {

      window.addEventListener("scroll", handleScrolling);

      return () => {
         window.removeEventListener("scroll", handleScrolling);
      };

   }, [handleScrolling]);

   // initial fetch
   useEffect(() => {

      handleScrolling();

   }, []);

   return (

      <div className='historyyWrapper'>

         <h2 className='taskHistoryheading'>Task History</h2>

         {/* initial loading */}
         {
            initialLoading && (
               <div className='initial_Loading_wrappor'>

                  <span>Loading...</span>

                  <Spinner />

               </div>
            )
         }

         {/* no task */}
         {
            noTaskAval && (
               <div>
                  📭 No task history.
               </div>
            )
         }

         {/* tasks */}
         {
            tasks.map((task, index) => (

               <div
                  key={task._id}
                  className='HistoryPageTaskWrapper'
               >
                 <span className='historyTask'>{task.task}</span>

                 <div className='statusIndexwrapper'>
                   <span>{task.status}</span>
                   <span>{index + 1}</span>
                 </div>
               </div>

            ))
         }

         {/* bottom loading */}
         {
            bottomLoading && (
               <Spinner />
            )
         }

      </div>
   );
};