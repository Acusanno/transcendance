import * as React from 'react';

import GameApp from './components/Game/Game'
import Profile from './components/Profile/Profile'
import Connection from './components/connection/Connection';
import Header from './components/Header/Header';
import Chat from './components/Chat/Chat';
import './styles/styles.scss';
import { createBrowserRouter, Outlet, RouterProvider, } from "react-router-dom";
import NameForm from "./components/connection/form_name_avatar"
import Queu from './components/Game/queu';
import { Navigate } from "react-router-dom";
import { useAppSelector } from './redux/Hook';

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);



const ProtectedRoute = (props: { children: any }) => {
  const user = useAppSelector(state => state.user);
  console.log(user);

  if (user.user == undefined || (user.user != undefined && user.user.username == undefined)) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return props.children;
};


const PublicRoute = (props: { children: any }) => {
  const user = useAppSelector(state => state.user);
  if (user.user) {
    // user is authenticated
    return <Navigate to="/" />;
  }
  return props.children;
};


const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element:
          // <PublicRoute>
            <Connection />,
          // </PublicRoute>
      },
      {
        path: "/Home",
      },
      {
        path: "/Chat",
        element:
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
      },
      {
        path: "/Profile/:id",
        element:
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>,
      },
      {
        path: "/Game",
        element:
          <ProtectedRoute>
            <Queu />,
          </ProtectedRoute>,
      },
      {
        path: "/Game/:id",
        element:
          <ProtectedRoute>
            <GameApp />,
          </ProtectedRoute>,
      },
    ]
  }
]);

export default router;
