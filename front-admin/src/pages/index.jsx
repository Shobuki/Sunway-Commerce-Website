
import Sidebar from "../components/Sidebar";
import Headbar from "../components/Headbar";


const Home = () => {

  return (
    <div className="flex h-screen ml-60 mt-8">
  
      <div className="flex flex-col flex-grow">

      <main className="w-full bg-gray-100 flex flex-col items-center justify-center text-center py-12">
  <h1 className="text-2xl font-bold">Welcome to SunFlex Admin</h1>
  <p className="mt-4 text-gray-600">
    Manage your application from here. Use the sidebar to navigate between sections.
  </p>
  <div className="mt-8">
    <img src="/images/logo.png" alt="Sunway Logo" className="max-w-xs md:max-w-md lg:max-w-lg object-contain" />
  </div>
</main>

      </div>
    </div>
  );
};

export default Home;
