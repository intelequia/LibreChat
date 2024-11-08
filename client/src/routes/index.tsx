import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import {
  Login,
  Registration,
  RequestPasswordReset,
  ResetPassword,
  VerifyEmail,
  ApiErrorWatcher,
} from '~/components/Auth';
import { AuthContextProvider } from '~/hooks/AuthContext';
import StartupLayout from './Layouts/Startup';
import LoginLayout from './Layouts/Login';
import dashboardRoutes from './Dashboard';
import ShareRoute from './ShareRoute';
import ChatRoute from './ChatRoute';
import Search from './Search';
import Root from './Root';
import BusinessHeader from '~/utils/intelequia/Components/BusinessHeader/businessHeader';

const AuthLayout = () => (
  <AuthContextProvider>
    <Outlet />
    <ApiErrorWatcher />
  </AuthContextProvider>
);

const ChatLayout = () => (
  <>
    <BusinessHeader/>
    <Root />
  </>
); 

export const router = createBrowserRouter([
  {
    path: 'share/:shareId',
    element: <ShareRoute />,
  },
  {
    path: '/',
    element: <StartupLayout />,
    children: [
      {
        path: 'register',
        element: <Registration />,
      },
      {
        path: 'forgot-password',
        element: <RequestPasswordReset />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: 'verify',
    element: <VerifyEmail />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: <LoginLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
        ],
      },
      dashboardRoutes,
      {
        path: '/',
        element: <ChatLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/c/new" replace={true} />,
          },
          {
            path: 'c/:conversationId?',
            element: <ChatRoute/>,
          },
          {
            path: 'search',
            element: <Search />,
          },
        ],
      },
    ],
  },
]);
