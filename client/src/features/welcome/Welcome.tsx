import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/useAuthStore";
import Loader from "../../components/Loader";

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchMe();
    }
  }, [user, fetchMe]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome, {user.name || "User"} !
          </h2>
          <p className="text-gray-600">
            Email: {user.email}
          </p>
        </div>

        {/* Create Note Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/notes")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Create Note
          </button>
        </div>

        {/* Notes Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sample Notes - these would be replaced with actual notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">Note 1</h3>
                <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">Note 2</h3>
                <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
