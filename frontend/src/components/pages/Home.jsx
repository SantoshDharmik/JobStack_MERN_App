import React from 'react'

import Header from '../sections/includes/Header'
import Footer from '../sections/includes/Footer'

const Home = () => {
  return (
    <>
    <Header/>



    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]
                    relative overflow-hidden">

      {/* Animated Background Circles */}
      <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute right-10 bottom-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-25 animate-bounce"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl
                      p-10 rounded-3xl shadow-2xl border border-white/20
                      w-[90%] max-w-md text-center">

        <h1 className="text-3xl font-bold text-white mb-6 tracking-wide">
          Welcome to <span className="text-purple-300">JobStack</span>
        </h1>

        <p className="text-gray-200 mb-8">
          Choose how you want to continue
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4">

          <button
            onClick={() => window.location.href = "user-login-register"}
            className="w-full py-3 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600
                       shadow-lg hover:shadow-purple-600/40
                       hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            User Login
          </button>

          <button
            onClick={() => window.location.href = "user-login-register"}
            className="w-full py-3 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600
                       shadow-lg hover:shadow-emerald-500/40
                       hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            Company Login
          </button>

        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}

export default Home
