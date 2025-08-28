import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import Signup from '../features/auth/pages/Signup';
import VerifyOtp from '../features/auth/pages/VerifyOtp';
import Login from '../features/auth/pages/Login';
import Welcome from '../features/welcome/Welcome';
import Notes from '../features/notes/pages/Notes';

function Protected({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  
  if (!user) {
    return <Navigate to="/signup" replace />;
  }
  
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/signup" replace />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/verify-otp',
    element: <VerifyOtp />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/welcome',
    element: (
      <Protected>
        <Welcome />
      </Protected>
    )
  },
  {
    path: '/notes',
    element: (
      <Protected>
        <Notes />
      </Protected>
    )
  }
]);
