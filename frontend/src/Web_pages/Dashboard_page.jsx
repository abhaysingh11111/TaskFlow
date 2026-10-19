import React, { useEffect, useState ,useContext } from 'react'
import './Dashboard_page.css'
import { FaDotCircle, FaLongArrowAltUp, FaPlus } from "react-icons/fa";
import {Chart as ChartJS, ArcElement,CategoryScale,LinearScale,BarElement,LineElement,PointElement,Tooltip,Legend} from "chart.js";
ChartJS.register(ArcElement,CategoryScale,LinearScale,BarElement,LineElement,PointElement,Tooltip,Legend);
import { Line, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { Spinner } from '../Components/Spinner/spinner';
import { useNavigate } from "react-router-dom";
import { DashboardContext } from '../Context/dashboardRefresh_Context.jsx';

export const Dashboard_page = () => {

  const [loading, setLoading] = useState(true); const navigate = useNavigate();
  const [bottom_Loading, setBottom_loading] = useState(false);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [pending, setPending] = useState(0);
  const [deleted, setDeleted] = useState(0);
  const [weaklyTotal_completed , setWeaklytotal_Completed] = useState(0) ;
  const [weaklyTotal_deleted , setWeaklytotal_Deleted] =  useState(0) ;
  const [weaklyTotal_pending, setWeaklytotal_Pending] = useState(0) ;
  const [weaklyTotal , setWeaklytotal] = useState(0) ;
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday" ];
  const [completedData, setCompletedData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const { refreshKey } = useContext(DashboardContext);

  const line_Chart_data = {
    labels: days,
    datasets: [
      {
        label: "Completed",
        data: completedData
      },
      {
        label: "Pending",
        data: pendingData
      }
    ]
  };

  const pie_Chart_data = {
    labels: ["Completed", "Pending", "Deleted"],
    datasets: [
      {
        data: [ completed , pending , deleted],
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      }
    },
       maintainAspectRatio: false,
  };

  useEffect(() => {
   const fetchData = async () => {

      const today = new Date(); // getting todays fulll daye like 1 june 2023
      const end_Date = today.toDateString(); // here data in to string
      const start_Date = new Date(today); //
      start_Date.setDate(today.getDate() - today.getDay());

      try {
        const req = await fetch(`${import.meta.env.VITE_API_BASE_URL}/task-API/task_Dashboard_data`,{
            method: "POST",
            credentials: "include",
            headers:{
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              start_Date,
              end_Date
            })
          }
        );

        const res = await req.json();
        setLoading(false);

        if (req.status === 401) {
          toast.error("Authentication required");
          navigate('/Sign_up');
        }
        else if (req.status === 403) {
          toast.error("Session expired. Please login again");
          navigate("/Log_in");
        }
        else if (req.status === 500) {
          toast.error("Internal server error try again later");
        }
        else if(!req.ok){
          toast.error("Something went wrong try again later .") ;
        }
        else {

          if (res.status === true) {
            console.log(res.data.total_Task);
            setCompleted(res.data.total_Task.completed);
            setDeleted(res.data.total_Task.deleted);
            setPending(res.data.total_Task.pending);
            setTotal(res.data.total_Task.total);
            const completedArr = [];
            const pendingArr = [];

            days.forEach(day => {
              completedArr.push(
                res.data.daywise_Task[day]?.completed || 0
              );

              pendingArr.push(
                res.data.daywise_Task[day]?.pending || 0
              );
            });

            setCompletedData(completedArr);
            setPendingData(pendingArr);
            setWeaklytotal(res.data.weekly_Task.total) ;
            setWeaklytotal_Completed(res.data.weekly_Task.completed) ;
            setWeaklytotal_Deleted(res.data.weekly_Task.deleted)  ;
            setWeaklytotal_Pending(res.data.weekly_Task.pending) ;
          }
        }
      }
      catch(err) {
        setLoading(false);
        toast.error("Internal server error try again after some time");
        console.log(err.message);
      }
    };

    fetchData();
  }, [refreshKey]);

  return (

    <div className='main_containor'>
      <div className='top-Section'>
        {loading && (
          <Spinner />
        )}

        <div className='first_Card'>
          <div className='first_Card_left'>
            <h2 className='totalTask'>Total Tasks</h2>
            <h1 className='totalTaskNumber'>{total}</h1>
            <div>
                <FaLongArrowAltUp />
              <div>
                <span><FaPlus /></span>
                <span>{weaklyTotal|| 0}</span>
              </div>

              <h2 className='weekHeading'>this week</h2>
            </div>

          </div>

          <div className='first_Card_right'>

            <img
              src="https://cdn-icons-png.flaticon.com/512/762/762686.png"
              alt="total task img"
              className='total_Task_img'
            />

          </div>

        </div>

        <div className='second_Card'>
          <div className='second_Card_left'>
            <h2 className='completeTask'>Completed Tasks</h2>
            <h1 className='totalTaskNumber'>{completed}</h1>
            <div>
              <FaLongArrowAltUp />
              <div>
                <span><FaPlus /></span>
                <span>{weaklyTotal_completed|| 0}</span>
              </div>

              <h2 className='weekHeading'>this week</h2>
            </div>

          </div>

          <div className='second_Card_right'>

            <img
              src="https://www.iconshock.com/image/Vista/Project_management/task_completed"
              alt="server error"
              className='complete_Task_img'
            />

          </div>
        </div>

        <div className='third_Card'>
          <div className='third_Left'>
            <h2 className='pendingTask'>Pending Tasks</h2>
            <h1 className='totalTaskNumber'>{pending}</h1>
            <div>

              <FaLongArrowAltUp />

              <div>
                <span><FaPlus /></span>
                <span>{weaklyTotal_pending|| 0}</span>
              </div>

              <h2 className='weekHeading'>this week</h2>

            </div>

          </div>

          <div>

            <img
              src="https://static.vecteezy.com/system/resources/previews/016/311/739/non_2x/pending-tasks-icon-design-free-vector.jpg"
              alt="server error"
              className='pending_Task_img'
            />

          </div>
        </div>

        <div className='fourth_Card'>
          <div>
            <h2 className='incompletedTask'>Deleted Tasks</h2>
            <h1 className='totalTaskNumber'>{deleted}</h1>

            <div>
              <FaLongArrowAltUp />

              <div>
                <span><FaPlus /></span>
                <span>{weaklyTotal_deleted || 0}</span>
              </div>

              <h2>this week</h2>
            </div>

          </div>

          <div>
            <img
              src="https://cdn3d.iconscout.com/3d/premium/thumb/delete-task-3d-icon-png-download-12470285.png"
              alt="server error"
              className='incompleted_Task_img'
            />
          </div>
        </div>
      </div>

      <div className='mid-graphs-section'>

        <div className='line_chart_section'>

          <div className='line_chart-left-description'>
            <div>
              <h1 className='weeklyTaskactivityTextGraph'>Weekly Task Activity</h1>
              <h2>Day-wise overview of tasks added and pending</h2>
            </div>
            <div>
              <div><span><FaDotCircle /></span><span>Completed</span></div>
              <div><span><FaDotCircle /></span><span>Pending</span></div>
            </div>
           </div>
           <div>
              <Line data={line_Chart_data} options={options} className='line-chart' />
           </div>

          </div>


        <div className='pie_chart_section'>

          <div className='pie_chart-left-description'>
            <div>
              <h1 className='weeklyTaskactivityTextoval'>Weekly Task Activity</h1>
              <h2>Day-wise overview of tasks added and pending</h2>
            </div>

            <div>
              <div><span><FaDotCircle /></span><span>Completed</span></div>
              <div><span><FaDotCircle /></span><span>Pending</span></div>
            </div>
          </div>

            <div>
          <Pie data={pie_Chart_data} options={options} className='pie-chart' />

            </div>
        </div>

      </div>

      <div className='bottom-section'>
         <h2>Hii nice to meet you</h2>
      </div>

    </div>
  );
};