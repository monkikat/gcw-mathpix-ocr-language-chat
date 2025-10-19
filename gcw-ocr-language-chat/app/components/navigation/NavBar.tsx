"use client"

import { useRouter } from "next/navigation"

const NavBar = () => {
    const router = useRouter();

  return (
    <div className="w-full h-fit fixed top-0 flex justify-between p-8 text-sm z-50 bg-creme/80 backdrop-blur-sm">
        <p onClick={() => router.push('/')}
        className="text-2xl text-deepbROWN font-bold transition-all duration-300 ease-in-out hover:scale-105 hover:cursor-pointer">PolyPix</p>
        <div className="flex space-x-8 items-center">
            <button onClick={() => router.push("/")}
            className="text-deepbROWN hover:text-darkSage transition-all duration-300 ease-in-out hover:scale-105 hover:cursor-pointer"
            >
              Home
            </button>
            <button onClick={() => router.push('/modes')}
            className="hover:bg-darkSage hover:text-creme text-deepbROWN px-4 py-1 hover:scale-105 rounded-4xl transition-all duration-300 ease-in-out hover:shadow-lg">Modes</button>
            <button className="text-deepbROWN hover:text-darkSage transition-all duration-300 ease-in-out hover:scale-105 hover:cursor-pointer">The Team</button>
        </div>
    </div>
  )
}

export default NavBar
