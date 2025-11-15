import axios from "axios"

let baseUrl = import.meta.env.VITE_BASE_API_URL + "/user"

// UI register 
const requestUserRegister = async (data) => {
    try{
        let result = await axios.post(`${baseUrl}/register`,data)
        return result

    }catch(err){
        throw err
    }
}

export {requestUserRegister}
