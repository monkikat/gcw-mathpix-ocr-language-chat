const NavBar = () => {
  return (
    <div className="w-full h-fit fixed top-0 flex justify-between p-4 text-sm">
        <p className="text-2xl">PolyPix</p>
        <div className="flex space-x-8">
            <button>The Team</button>
            <button className="hover:bg-darkSage hover:text-white px-4 py-1 hover:scale-105 rounded-4xl hover:cursor-pointer">Modes</button>
        </div>
    </div>
  )
}

export default NavBar