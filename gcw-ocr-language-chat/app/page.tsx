import Image from "next/image";
import Landing from "./components/Landing";
import UploadComponent from "./components/UploadComponent";

export default function Home() {
  return (
    <div className="h-screen w-full p-24">
      <div className="h-full w-full flex items-center justify-end">
        <UploadComponent />
      </div>
    </div>
  );
}
