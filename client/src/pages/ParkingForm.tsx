import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface FormData {
  code: string;
  name: string;
  totalSpaces: string;
  location: string;
  feePerHour: string;
}

function ParkingForm() {
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    totalSpaces: '',
    location: '',
    feePerHour: ''
  });
  const [error, setError] = useState<string>('');
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!context) throw new Error('AuthContext must be used within an AuthProvider');
    const { user } = context;
    if (!user || user.role !== 'admin') {
      setError('Access denied: Only admins can add parkings');
      return;
    }
    try {
      await axios.post(
        'http://localhost:3001/api/parkings',
        {
          code: formData.code,
          name: formData.name,
          totalSpaces: parseInt(formData.totalSpaces),
          location: formData.location,
          feePerHour: parseFloat(formData.feePerHour)
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/parkings');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add parking');
    }
  };

  if (error && (!context?.user || context.user.role !== 'admin')) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Add Parking</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="code">
              Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter parking code"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter parking name"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="totalSpaces">
              Total Spaces
            </label>
            <input
              type="number"
              id="totalSpaces"
              name="totalSpaces"
              value={formData.totalSpaces}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter total spaces"
              required
              min="1"
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="location">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="feePerHour">
              Fee Per Hour
            </label>
            <input
              type="number"
              id="feePerHour"
              name="feePerHour"
              value={formData.feePerHour}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter fee per hour"
              required
              step="0.01"
              min="0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Parking
          </button>
        </form>
      </div>
    </div>
  );
}

export default ParkingForm;