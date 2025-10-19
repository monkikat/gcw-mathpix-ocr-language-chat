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
            <button className="bg-lightSage rounded-4xl px-4 py-1 hover:bg-darkSage hover:text-creme text-deepbROWN transition-all duration-300 ease-in-out hover:shadow-lg">Back</button>
        </div>
        <div className="flex justify-between w-full space-x-12 ">
            <div className="bg-paleSage space-y-4 rounded-4xl px-4 py-12 flex flex-col items-center text-deepbROWN flex-1 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                <Image 
                  src={documentIcon} 
                  alt="script mode" 
                  width={60} 
                  height={60}
                  className="transition-transform duration-300 ease-in-out"
                />
                <div className='text-center pb-4 flex flex-col items-center'>
                  <p className='text-3xl'>Script Mode</p>
                  <p className='text-sm w-4/5'>Convert handwritten notes to text powered by MathPix, read aloud</p>
                </div>
                <button onClick={() => router.push("/")}
                  className="px-4 py-1 bg-darkSage text-creme hover:bg-darkSage/90 hover:scale-105 rounded-4xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                >
                  Start
                </button>
            </div>
            <div className="bg-paleSage space-y-4 rounded-4xl px-4 py-12 flex flex-col items-center text-deepbROWN flex-1 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                <Image 
                  src={convoIcon} 
                  alt="chat mode" 
                  width={60} 
                  height={60}
                  className="transition-transform duration-300 ease-in-out"
                />
                <div className='text-center pb-4 flex flex-col items-center'>
                  <p className='text-3xl'>Chat Mode</p>
                  <p className='text-sm w-4/5'>Practice your conversational skills with our multilingual ai chatbot</p>
                </div>
                <button onClick={() => router.push("/chat_mode")}
                  className="px-4 py-1 bg-darkSage text-creme hover:bg-darkSage/90 hover:scale-105 rounded-4xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                >
                  Start
                </button>
            </div>
            <div className="bg-paleSage space-y-4 rounded-4xl px-4 py-12 flex flex-col items-center text-deepbROWN flex-1 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                <Image 
                  src={refreshIcon} 
                  alt="translate mode" 
                  width={60} 
                  height={60}
                  className="transition-transform duration-300 ease-in-out"
                />
                <div className='text-center pb-4 flex flex-col items-center'>
                  <p className='text-3xl'>Translate Mode</p>
                  <p className='text-sm w-4/5'>Flash your language skills with PolyPix x Gemini AI flashcards</p>
                </div>
                <button onClick={() => router.push("/translate_mode")}
                  className="px-4 py-1 bg-darkSage text-creme hover:bg-darkSage/90 hover:scale-105 rounded-4xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                >
                  Start
                </button>
            </div>
        </div>
    </div>
  )
}

export default ModesClient
