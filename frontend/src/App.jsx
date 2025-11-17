import React from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

//pages 
import Home from "./components/pages/Home.jsx"
import UserLoginRegister from "./components/pages/UserLoginRegister.jsx"

import UserDashboard from "./components/pages/UserDashboard/userDashboard.jsx"

// context 
import { UserProvider } from "./context/userContext.jsx"
import { MessageProvide } from "./context/messageContext.jsx"
import Message from "./components/sections/actions/Message.jsx"
import { IoMdPhonePortrait } from "react-icons/io"


const App = () => {
    return (
        <>
            <UserProvider>
                <MessageProvide>
                    <Message />
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/user-login-register" element={<UserLoginRegister />} />
                            <Route path="/user/dashboard" element={<UserDashboard/>}/>
                        </Routes>
                    </Router>
                </MessageProvide>
            </UserProvider>
        </>
    )
}

export default App