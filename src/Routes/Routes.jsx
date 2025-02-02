import {
    createBrowserRouter,
  
  } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import Errorpage from "../Pages/Errorpage";
import Home from "../Pages/Home";
import Login from "../Pages/Login";


  const routes = createBrowserRouter([
    {
      path: "/",
      element:<MainLayout></MainLayout>,
      errorElement:<Errorpage></Errorpage>,
      children:[
        {
          path:'/',
          element:<Home></Home>,
          // loader: () => {
          //   return fetch('/estates.json')
          // }
        },
        {
          path:'/login',
          element:<Login></Login>,
        },
    
      ]
    },
  ]);
export default routes