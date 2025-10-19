"use client"

import { useRouter } from "next/navigation"

const NavBar = () => {
    const router = useRouter();

  return (
    <div className="w-full h-fit fixed top-0 flex justify-between p-8 text-sm">
        <p className="text-2xl">PolyPix</p>
        <div className="flex space-x-8">
            <button onClick={() => router.push("/")}
            className="hover:cursor-pointer"
            >
              Home
            </button>
            <button onClick={() => router.push('/modes')}
            className="hover:bg-darkSage hover:text-white px-4 py-1 hover:scale-105 rounded-4xl hover:cursor-pointer">Modes</button>
            <button>The Team</button>
        </div>
    </div>
  )
}

export default NavBar