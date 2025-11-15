import { useState, useEffect, createContext, useContext, children } from "react";

const messageContext = createContext()

let MessageProvide = ({ children }) => {

    let [message, setMessage] = useState({
        status: "", content: "", open: false
    })

    let triggerMessage = (status, content) => {
        setMessage({ status, content, open: true })

        setTimeout(() => {
            setMessage({
                status: "", content: "", open: false
            })
        }, 3000)
    }
    return (
        <messageContext.Provider value={{ message, triggerMessage }}>
            {children}
        </messageContext.Provider>

    )
}

const useMessage = () => useContext(messageContext)

export { MessageProvide, useMessage }

