import NavBar from "./components/navigation/NavBar";
import UploadComponent from "./components/UploadComponent";

export default function Home() {
  return (
    <div className="h-screen w-full">
      <NavBar/>
      <div className="h-full w-full flex items-center justify-end">
        <UploadComponent />
      </div>
    </div>
  );
}
