import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface FormData {
  plateNumber: string;
}

function VehicleForm() {
  const [formData, setFormData] = useState<FormData>({ plateNumber: '' });
  const [error, setError] = useState<string>('');
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!context) throw new Error('AuthContext must be used within an AuthProvider');
    try {
      await axios.post(
        'http://localhost:3001/api/vehicles',
        { plateNumber: formData.plateNumber },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/vehicles');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add vehicle');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Add Vehicle</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="plateNumber">
              Plate Number
            </label>
            <input
              type="text"
              id="plateNumber"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter plate number"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}

export default VehicleForm;