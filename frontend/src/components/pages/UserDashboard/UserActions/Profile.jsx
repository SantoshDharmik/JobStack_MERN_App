import React, { useState } from 'react'

// style
import "./user-action.scss"

// react icons
import { FaTimes, FaUser, FaCamera, FaCheckCircle } from 'react-icons/fa'
import { FaPhone, FaLocationDot } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";

// context
import { useUser } from '../../../../context/userContext'
import { useMessage } from '../../../../context/messageContext';

// user api
import { userProfilePicture, requestOTPForPasswordReset, requestUserEmailOtpVerificationPasswordReset } from '../../../../api/userAPI';

// dependency
import OtpInput from 'react-otp-input';

function Loader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
</div>


    );
}

const Profile = () => {

    // profile_picture 
    let { user, fetchUserProfile } = useUser()

    let { triggerMessage } = useMessage()

    let [triggerProfilePictureChange, setTriggerProfilePictureChange] = useState(false)

    let [selectedImage, setSelectedImage] = useState(null)

    let [previewUrl, setPreviewUrl] = useState(null)


    // password 
    let [newPassword, setNewPassword] = useState({
        email: "", userOtp: "", newPassword: ""
    })

    let [otp, setOtp] = useState(0)

    let [loading, setLoading] = useState(false)

    let [openOTPFormForPasswordReset, setOpenOTPFormForPasswordReset] = useState(false)

    let [screen, setScreen] = useState("request");

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            triggerMessage("warning", "invalid/missing file !")
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            triggerMessage("warning", "invalid/missing file !")
        }
    }

    const handleProfilePictureUpload = async () => {
        let formData = new FormData();
        formData.append("file", selectedImage);

        try {
            let token = localStorage.getItem("token");

            let result = await userProfilePicture(token, formData);

            console.log(result)

            setTriggerProfilePictureChange(false)
            triggerMessage("success", "Profile picture uploaded!");
            // window.redirect("/")
            fetchUserProfile()
            setPreviewUrl(null)
            setSelectedImage(null)

        } catch (err) {
            setTriggerProfilePictureChange(false)
            triggerMessage("danger", err?.response?.data?.message || "Upload failed");
        }
    }

    const handlePasswordResetButtonClick = async () => {

        setLoading(true)

        setOpenOTPFormForPasswordReset(true)

        setScreen("verify");

        try {

            let result = await requestOTPForPasswordReset(user.email.userEmail)

            setOpenOTPFormForPasswordReset(true)

            setScreen("verify");


            triggerMessage("success", `OTP sent to ${user.email.userEmail}`)
        } catch (err) {
            console.log('failed to send an otp for password reset !', err)
            triggerMessage("danger", "failed to send OTP for password reset !")
        }
        finally {
            setLoading(false)
        }
    }

    const handlePasswordResetOtpVerification = async (e, email) => {
        e.preventDefault()
        setLoading(true);
        try {
            let playLoad = {
                email: email,
                userOtp: otp,
                newPassword: newPassword.newPassword
            }

            let result = await requestUserEmailOtpVerificationPasswordReset(playLoad)

            if (result.status != 202) throw ("unable to verify OTP !")

            triggerMessage("success", result.data.message ? result.data.message : "OTP verifed successfully & password reseted !", true)

            setOpenOTPFormForPasswordReset(false)

            // close()

        } catch (err) {
            console.log("verify otp error : ", err)
            triggerMessage("danger", err.message ? err.message : err, true)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    return (

        <>

            <div id='user-profile' className='shadow'>
                <div className='bg-dark'></div>
                <div className='information flex'>
                    <div className='pnpa'>
                        {/* image */}
                        <div className='profile-picture'>
                            {
                                user.logedIn ?
                                    user.profile_picture ?

                                        <>
                                            <img src={user.logedIn ? `${import.meta.env.VITE_BASE_API_URL}/profile_pictures/${user.profile_picture}` : ""} alt="Profile Picture" />
                                            <button onClick={() => setTriggerProfilePictureChange(true)} className='bg-primary px-2 py-1 text-light rounded hover:bg-dark transition'>
                                                <FaCamera />
                                            </button>
                                        </>
                                        :
                                        <button onClick={() => setTriggerProfilePictureChange(true)} className='bg-primary px-2 py-1 text-light rounded hover:bg-dark transition'>
                                            <FaCamera />
                                        </button>

                                    : null
                            }

                            {
                                triggerProfilePictureChange &&
                                <div className='profile-picture-change'>
                                    <div className='picture-change-container rounded relative'>
                                        <button onClick={() => {
                                            setSelectedImage(null)
                                            setPreviewUrl(null)
                                            setTriggerProfilePictureChange(false)
                                        }} className='bg-red-600 p-2 rounded-full absolute text-white start-full top-0 -translate-x-1/2 -translate-y-1/2'>
                                            <FaTimes />
                                        </button>
                                        <div className='content flex justify-center items-center p-52'>
                                            <div
                                                className='grow upload-area bg border border-dashed border-dark p-5 rounded'
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                            >

                                                <button
                                                    onClick={() => {

                                                    }}
                                                >

                                                </button>

                                                <label htmlFor="profileImage" className='cursor-pointer'>
                                                    {
                                                        previewUrl ? (
                                                            <div className='flex justify-center items-center flex-col gap-3'>
                                                                <span className='font-bold'>Your Selected Profile Picture !</span>
                                                                <img src={previewUrl} className='h-40 w-40' />
                                                            </div>
                                                        ) : (
                                                            <div className='flex flex-col items-center justify-center gap-3'>
                                                                <span>Drag & Drop Profile Picture Here !</span>
                                                                <span className='bg-blue-200 rounded p-2'>or <b>Click</b> to select.</span>
                                                            </div>
                                                        )
                                                    }
                                                </label>

                                                <input
                                                    type="file"
                                                    id='profileImage'
                                                    accept='image/*'
                                                    onChange={handleFileSelect}
                                                    className='hidden'
                                                />

                                                {
                                                    selectedImage &&
                                                    <div className='flex justify-center my-10'>
                                                        <button
                                                            onClick={handleProfilePictureUpload}
                                                            className='bg-primary text-light font-bold px-3 py-1 cursor-pointer'>
                                                            Upload
                                                        </button>
                                                    </div>
                                                }

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                        </div>
                        {/* NPA*/}
                        <div className='user-info-container p-5 flex flex-col gap-3'>
                            <div className='flex gap-3 p-3 shadow'>
                                <div className='flex items-center gap-3'>
                                    <span className='user-info-icon'>
                                        <FaUser />
                                    </span>
                                    <span>{user.logedIn ? user.name : null}</span>
                                </div>

                                <div className='flex items-center gap-3'>
                                    <span className='user-info-icon' >
                                        <FaPhone />
                                    </span>
                                    <span>{user.logedIn ? user.phone : null}</span>
                                </div>
                            </div>
                            <div className='p-3 shadow'>
                                <div className='flex items-center gap-3'>
                                    <span className='user-info-icon'>
                                        <IoMdMail />
                                    </span>
                                    <span>{user.logedIn ? user.email.userEmail : null}</span>
                                    <FaCheckCircle className={`${user.logedIn ? user.email.verified ? "text-green-500" : "" : ""}`} />
                                </div>
                            </div>
                            <div className='p-3 shadow'>
                                <span className='flex  gap-3 items-center'>
                                    <span className='user-info-icon'>
                                        <FaLocationDot />
                                    </span>
                                    {
                                        user.logedIn ?
                                            user.address.street + ", " + user.address.city + ", " + user.address.state + ", " + user.address.country + ", " + user.address.pincode
                                            : null
                                    }
                                </span>
                            </div>
                        </div>
                        
                        {/* reset password  */}
                        <div className='flex gap-3 mt-2'>

                            {loading && <Loader />}

                            <div className={`${loading ? "pointer-events-none opacity-100" : ""}`}></div>

                            {/* RESET PASSWORD MAIN BUTTON */}
                            <button
                                type='button' className='bg-primary text-light p-2 rounded hover:bg-dark'
                                onClick={() => setOpenOTPFormForPasswordReset(true)}
                            >
                                Reset Password
                            </button>


                            {/* POPUP */}
                            {openOTPFormForPasswordReset && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">

                                    <div className="bg-white w-[380px] p-6 rounded-xl shadow-xl relative animate-scaleIn">
                                        
                                        {/* request OTP  */}
                                        {screen === "request" && (
                                            <div className='p-4 my-2 flex flex-col gap-4 justify-center items-center'>
                                                <span>Click on request to send an OTP</span>
                                                <span className='rounded text-light font-bold p-3 bg-[rgba(var(--primary),.75)]'>at {user ? user.email.userEmail : "not found !"}</span>
                                                <button type='button' onClick={handlePasswordResetButtonClick} className='bg-green-400 rounded hover:bg-green-500 px-2 py-1'>
                                                    Request
                                                </button>
                                            </div>
                                        )}

                                        {/* verify password  */}
                                        {screen === "verify" && (
                                            <div className='verify-password-reset'>
                                                {loading && <Loader />}

                                                <div className={`${loading ? "pointer-events-none opacity-100" : ""}`}>
                                                <form onSubmit={(e) => { handlePasswordResetOtpVerification(e, user ? user.email.userEmail : "") }} className='h-full flex flex-col justify-center items-center p-5 gap-3'>
                                                    <h1 className='text-2xl font-bold'>Verify <span className='text-primary'>Email</span></h1>
                                                    <span className='text-center'>An otp has been sent on email <span className='text-primary'>{user ? user.email.userEmail : ""}</span></span>
                                                    <OtpInput
                                                        value={otp}
                                                        onChange={setOtp}
                                                        numInputs={4}
                                                        renderSeparator={<span className='mx-2'>-</span>}
                                                        isInputNum={true}
                                                        shouldAutoFocus={true}
                                                        inputStyle={{
                                                            border: "1px solid black",
                                                            borderRadius: "8px",
                                                            width: "54px",
                                                            height: "54px",
                                                            fontSize: "12px",
                                                            color: "#000",
                                                            fontWeight: "400",
                                                            caretColor: "blue"
                                                        }}
                                                        focusStyle={{
                                                            border: "1px solid #CFD3DB",
                                                            outline: "none"
                                                        }}
                                                        renderInput={(props) => <input {...props} />}
                                                    />
                                                    <input name="newPassword" value={newPassword.newPassword} onChange={(e) => {
                                                        setNewPassword(prev => {
                                                            return { ...prev, newPassword: e.target.value }
                                                        })
                                                    }} className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" type="text" placeholder='Enter new password !' />
                                                    <button type='submit' className={`${loading ? "bg-gray-800 hover:bg-gray-800" : "bg-green-600"} hover:bg-green-700 text-light font-bold px-6 py-2 rounded transition-all`} disabled={loading}>
                                                        {loading ? "Processing..." : "Verify OTP"}
                                                    </button>
                                                </form>
                                                </div>
                                            </div>
                                        )}


                                    </div>
                                </div>
                            )}


                            <button type='button' className='bg-primary text-light p-2 rounded hover:bg-dark'>
                                Upload Documents
                            </button>

                        </div>

                    </div>

                    <div className='reports p-3'>
                        {/* reports */}
                        <div className='applied-jobs rounded flex flex-col justify-center items-center gap-4 text-dark'>
                            <span className='text-4xl'>
                                {
                                    user.logedIn ? user.appliedJobs.length : 0
                                }
                            </span>
                            <span className='font-bold'>Applied Jobs</span>
                        </div>
                        <div className='profile-selected rounded flex flex-col justify-center items-center gap-4 text-dark'>
                            <span className='text-4xl'>
                                0
                            </span>
                            <span className='font-bold'>Profile Selected</span>
                        </div>
                    </div>
                    <div className='documents'>

                    </div>
                </div>
            </div>
        </>
    )
}


export default Profile
