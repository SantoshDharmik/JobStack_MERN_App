import { useState, createContext, useContext, children, useEffect } from "react";

const userContext = createContext()

let UserProvider = ({ children }) => {

    let [user, setUser] = useState({
        logenIn: false,
        name: "Santosh Dharmik"
    })

    return (
        <userContext.Provider value={{ user, setUser }}>
            {children}
        </userContext.Provider>
    )
}

const useUser = () => useContext(userContext)

export { UserProvider, useUser }