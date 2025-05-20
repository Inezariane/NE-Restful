import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ParkingList from './pages/ParkingList';
import ParkingForm from './pages/ParkingForm';
import CarEntry from './pages/CarEntry';
import CarExit from './pages/CarExit';
import Reports from './pages/Reports';
import VehicleForm from './pages/VehicleForm';
import VehicleList from './pages/VehicleList';
import MyTickets from './pages/MyTickets';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/parkings" element={<ParkingList />} />
            <Route path="/parkings/new" element={<ParkingForm />} />
            <Route path="/records/entry" element={<CarEntry />} />
            <Route path="/records/exit" element={<CarExit />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/tickets" element={<MyTickets />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
