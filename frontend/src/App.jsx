import React from "react"
import Home from "./components/pages/Home.jsx"
import UserLoginRegister from "./components/pages/UserLoginRegister.jsx"

import { BrowserRouter as Router, Routes, Route} from "react-router-dom"
import { UserProvider } from "./context/userContext.jsx"


const App = () =>{
    return(
        <>
        <UserProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/user-login-register" element={<UserLoginRegister/>}/>
            </Routes>
        </Router>
        </UserProvider>
        </>
    )
}                                        

export default App