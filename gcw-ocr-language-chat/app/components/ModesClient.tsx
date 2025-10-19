"use client"

import Image from 'next/image';
import documentIcon from "../src/documentIcon.svg";
import convoIcon from "../src/convoIcon.svg";
import refreshIcon from "../src/refreshIcon.svg";
import { useRouter } from "next/navigation"

const ModesClient = () => {
  const router = useRouter();

  return (
    <div className='space-y-8 p-8'>
        <div className="w-fit">
            <button className="bg-lightSage rounded-4xl px-4 py-1 hover:cursor-pointer text-deepbROWN">Back</button>
        </div>
        <div className="flex justify-between w-full space-x-12 ">
            <div className="bg-paleSage space-y-4 rounded-4xl px-8 py-12 flex flex-col items-center text-deepbROWN flex-1">
                <Image 
                  src={documentIcon} 
                  alt="script mode" 
                  width={60} 
                  height={60}
                />
                <div className='text-center pb-4 flex flex-col items-center'>
                  <p className='text-3xl'>Script Mode</p>
                  <p className='text-sm w-4/5'>Convert handwritten notes to text powered by MathPix, read aloud</p>
                </div>
                <button onClick={() => router.push("/")}
                  className="px-4 py-1 bg-darkSage text-creme hover:cursor-pointer hover:scale-105 rounded-4xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start
                </button>
            </div>
            <div className="bg-paleSage space-y-4 rounded-4xl px-8 py-12 flex flex-col items-center text-deepbROWN flex-1">
                <Image 
                  src={convoIcon} 
                  alt="script mode" 
                  width={60} 
                  height={60}
                />
                <div className='text-center pb-4 flex flex-col items-center'>
                  <p className='text-3xl'>Chat Mode</p>
                  <p className='text-sm w-4/5'>Practice your conversational skills with our multilingual ai chatbot</p>
                </div>
                <button onClick={() => router.push("/chat_mode")}
                  className="px-4 py-1 bg-darkSage text-creme hover:cursor-pointer hover:scale-105 rounded-4xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start
                </button>
            </div>
            <div className="bg-paleSage space-y-4 rounded-4xl px-8 py-12 flex flex-col items-center text-deepbROWN flex-1">
                <Image 
                  src={refreshIcon} 
                  alt="script mode" 
                  width={60} 
                  height={60}
                />
                <div className='text-center pb-4 flex flex-col items-center'>
                  <p className='text-3xl'>Translate Mode</p>
                  <p className='text-sm w-4/5'>Flash your language skills with PolyPix x Gemini AI flashcards</p>
                </div>
                <button onClick={() => router.push("/translate_mode")}
                  className="px-4 py-1 bg-darkSage text-creme hover:cursor-pointer hover:scale-105 rounded-4xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start
                </button>
            </div>
        </div>
    </div>
  )
}

export default ModesClient