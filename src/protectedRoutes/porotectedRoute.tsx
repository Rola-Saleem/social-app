import { useContext, type ReactElement } from "react"
import { Navigate } from "react-router-dom"
import { authContext } from "../contexts/authContext"
export default function ProtectedRoute({children}:{children:ReactElement}){
   // const isUserLogedIn:boolean=!!localStorage.getItem("token")
  const {isUserLogedIn}= useContext(authContext)
    return <>
    {/*feed */}
    {isUserLogedIn? children:<Navigate to={"/signin"}/>}
   </>
}