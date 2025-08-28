import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
