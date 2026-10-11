import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import {authContext} from "../contexts/authContext";

export default function MainLayout() {
      const {isLoading}= useContext(authContext)
  
  return isLoading?(
  <h1>Loading</h1>
  ):(
    <div>
      <Navbar />
      
      <Outlet />
    </div>
  );
}
