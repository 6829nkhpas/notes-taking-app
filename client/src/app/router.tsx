import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/useAuthStore";
import { useEffect } from "react";
import Signup from "../features/auth/pages/Signup";
import VerifyOtp from "../features/auth/pages/VerifyOtp";
import Login from "../features/auth/pages/Login";
import Welcome from "../features/welcome/Welcome";
import Notes from "../features/notes/pages/Notes";
import Navbar from "../components/Navbar";

function Layout() {
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    // If no user is loaded, try to fetch user data from the server
    if (!user) {
      fetchMe().catch(() => {
        // Silently fail if user is not authenticated
        // This will redirect to signup via Protected component
      });
    }
  }, [user, fetchMe]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  );
}

function Protected({ children }: { children: React.JSX.Element }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/signup" replace />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/welcome",
        element: (
          <Protected>
            <Welcome />
          </Protected>
        ),
      },
      {
        path: "/notes",
        element: (
          <Protected>
            <Notes />
          </Protected>
        ),
      },
    ],
  },
]);
