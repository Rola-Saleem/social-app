import { createContext, useState, type ReactElement } from "react";


export const counterContext= createContext<any>({});
export default function CounterContextProvider({children}:{children:ReactElement}){
    const[counter,setCounter] =useState(0);
    return <counterContext.Provider value={{counter,setCounter}}>
{children}
    </counterContext.Provider>
}