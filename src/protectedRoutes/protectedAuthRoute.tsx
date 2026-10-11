import { useContext, type ReactElement } from "react"
import { Navigate } from "react-router-dom"
import {authContext} from "../contexts/authContext"
export default function ProtectedAuthRoute({children}:{children:ReactElement}){
   // const isUserLogedIn:boolean=!!localStorage.getItem("token")
   const {isUserLogedIn}= useContext(authContext)
    return <>
    {/*feed */}
    {isUserLogedIn? <Navigate to={"/"}/>:children}
   </>
}