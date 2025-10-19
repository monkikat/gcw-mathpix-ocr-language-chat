import ModesClient from "../components/ModesClient"
import NavBar from "../components/navigation/NavBar"

const page = () => {
  return (
    <div className="h-screen w-full flex flex-col justify-center">
        <NavBar />
        <ModesClient/>
    </div>
  )
}

export default page