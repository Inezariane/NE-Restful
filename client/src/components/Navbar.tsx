import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }

  const { user, logout } = context;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Parking System</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/parkings">Parkings</Link>
              <Link to="/vehicles">Vehicles</Link>
              {user.role === 'user' && (
                <>
                  <Link to="/vehicles/new">Add Vehicle</Link>
                  <Link to="/tickets">My Tickets</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/parkings/new">Add Parking</Link>
                  <Link to="/records/entry">Car Entry</Link>
                  <Link to="/records/exit">Car Exit</Link>
                  <Link to="/reports">Reports</Link>
                </>
              )}
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;