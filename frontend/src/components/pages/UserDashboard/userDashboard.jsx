import React, { Profiler, useEffect, useState } from 'react'


//includes
import Header from "../../sections/includes/Header.jsx"
import Footer from "../../sections/includes/Footer.jsx"

import { useUser } from '../../../context/userContext.jsx'
import { useMessage } from "../../../context/messageContext.jsx"
import { useNavigate } from 'react-router-dom'
import { requestUserProfile } from '../../../api/userAPI.js'

// actions 
import Profile from './UserActions/Profile.jsx'
import JobTracker from './UserActions/JobTracker.jsx'


import "./userDashboard.scss"

const UserDashboard = () => {

  let { user, fetchUserProfile, logout } = useUser()

  let { triggerMessage } = useMessage()

  let [selectedMenu, setSelectedMenu] = useState("")

  let navigate = useNavigate()

  let token = localStorage.getItem("token")

  useEffect(() => {
    checkDashboardAccess()
  }, [])


  const checkDashboardAccess = async () => {
    try {

      if (!token) throw ("token not found !")

      let result = await requestUserProfile(token)

      if (result.status != 200) throw ("token is invalid please login first !")

      await fetchUserProfile()

      triggerMessage("success", `welcome ${result.data.userData.name} to dashboard !`)

    } catch (err) {

      console.log("cannot provide dashboard access !")
      navigate("/user-login-register")
      triggerMessage("warning", "Please login first to access dashboard !")

    }
  }

  const handleMenuSelection = (e) => {
    console.log(e.target.id)
    setSelectedMenu(e.target.id)
  }

  const renderComponent = () => {
    switch (selectedMenu) {
      case "profile-btn": return <Profile />
        break;
      case "job-tracker-btn": return <JobTracker />
        break;
      default: return <Profile />
    }
  }

  return (
    <>
      <Header />


      <div id='user-dashboard' className="min-h-screen bg-gray-100 flex">
        <div className='sidebar-menu content-container bg-gray-900 text-white w-72 p-6 shadow-xl flex flex-col justify-between'>

          <div className='intro text-light'>
            <ul className='flex flex-col gap-3'>
              <li className='font-bold text-2xl tracking-wide'>
                Hi, {user.name ? user.name : ""} !
              </li>

              <li className='text-primary text-sm text-gray-300'>
                Logged In : <span className='font-semibold'>{user.email ? user.email.userEmail : ""}</span>
              </li>

              <li className='flex flex-col'>
                <button
                  onClick={() => {
                    logout();
                    navigate("/user-login-register")
                  }}
                  className='bg-gradient-to-r from-red-500 to-red-600 w-full text-light py-2 px-5 rounded-xl font-bold 
                        hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40 
                        active:scale-95 transition-all duration-300'>
                  Logout
                </button>
              </li>
            </ul>

            <ul className='actions mt-12 flex flex-col gap-6'>

              <li id='profile-btn' onClick={handleMenuSelection}
                className=' w-full py-3 px-6 rounded-xl font-semibold text-white tracking-wide
    bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600
    hover:from-fuchsia-600 hover:via-purple-700 hover:to-indigo-700
    shadow-lg hover:shadow-purple-500/40
    active:scale-95 transition-all duration-300'>
                My Profile
              </li>

              <li>
                <li id='job-tracker-btn' onClick={handleMenuSelection} className='w-full py-3 px-6 rounded-xl font-semibold text-white tracking-wide
  bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600
  hover:from-fuchsia-600 hover:via-purple-700 hover:to-indigo-700
  shadow-lg hover:shadow-purple-500/40
  active:scale-95 transition-all duration-300
  flex flex-col'>
                  Job Application Tracker
                </li>
              </li>


            </ul>

          </div>

          <div className='profile'></div>
          <div className='job-tracker'></div>
        </div>

        <div className='content content-container flex-1 bg-white p-10 rounded-tl-3xl shadow-inner'>
          {renderComponent()}

        </div>
      </div>


      {/* <div id='user-dashboard'>
                <div className='sidebar-menu content-container'>
                   
                    <div className='intro text-light'>
                        <ul className='flex flex-col gap-2'>
                            <li className='font-bold'>Hi, {user.name ? user.name : ""} !</li>
                            <li className='text-primary'>
                                Loged In : {user.email ? user.email.userEmail : ""}
                            </li>
                            <li>
                                <button onClick={() => { logout(); navigate("/user-login-register") }} className='bg-red-500 text-light py-2 px-5 rounded font-bold hover:bg-red-700 transition'>Logout</button>
                            </li>
                        </ul>

                        <ul className='actions mt-10 flex flex-col gap-10'>
                            <li id='profile-btn' onClick={handleMenuSelection} className='shadow outline outline-1 p-4 rounded bg-primary font-bold cursor-pointer'>
                                My Profile
                            </li>
                            <li id='job-tracker-btn' onClick={handleMenuSelection} className='shadow outline outline-1 p-4 rounded bg-primary font-bold cursor-pointer'>
                                Job Application Tracker
                            </li>
                        </ul>

                    </div>
                    <div className='profile'></div>
                    <div className='job-tracker'></div>
                </div>
                <div className='content content-container'>
                    {renderComponent()}
                </div>
            </div> */}






      <Footer />
    </>
  )
}

export default UserDashboard
