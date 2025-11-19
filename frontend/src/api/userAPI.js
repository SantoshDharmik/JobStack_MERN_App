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

const requestUserEmailOtpVerification = async (data) =>{
    try{
        let result = await axios.post(`${baseUrl}/verify-otp`,data)
        return result
    } catch(err){
        throw err

    }
}

const requestUserLogin = async (data) =>{
    try{
        let result = await axios.post(`${baseUrl}/user-login`,data)
        return result

    }catch(err){
        throw err
    }
}

const requestUserProfile = async (token) => {
    try{
        let result =  await axios({
            method: "GET",
            url:`${baseUrl}/fetch-user-profile`,
                headers:{
                    authorization: token
                }

        })

        return result

    }catch(err){
        throw (err)
    }
}

const userProfilePicture = async (token, formData) => {
    try {
        const result = await axios.post(
            `${baseUrl}/upload-file/profile_picture`,
            formData,
            {
                headers: {
                    authorization: token
                    // DO NOT add Content-Type manually
                }
            }
        );

        return result.data;

    } catch (err) {
        throw err;
    }
};

const requestOTPForPasswordReset = async (email) => {
    try{

        let result = await axios.post(`${baseUrl}/password-reset-request`,{email})

        return result

    }catch(err){
        throw err
    }
}

const requestUserEmailOtpVerificationPasswordReset = async (data) =>{
    try{
        
        let result = await axios.post(`${baseUrl}/verify-reset-password-request`, data)

        return result

    }catch(err){
        throw err
    }
}

export {requestUserRegister,requestUserEmailOtpVerification,requestUserLogin,requestUserProfile, userProfilePicture,requestOTPForPasswordReset,requestUserEmailOtpVerificationPasswordReset}
