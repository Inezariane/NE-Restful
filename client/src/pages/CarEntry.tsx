import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface FormData {
  vehicleId: string;
  parkingId: string;
  entryDateTime: string;
}

interface ResponseData {
  record: any;
  ticket: { ticketNumber: string };
}

function CarEntry() {
  const [formData, setFormData] = useState<FormData>({
    vehicleId: '',
    parkingId: '',
    entryDateTime: ''
  });
  const [vehicles, setVehicles] = useState<{ id: string; plateNumber: string; user: { firstName: string; lastName: string } }[]>([]);
  const [parkings, setParkings] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!context) {
      throw new Error('AuthContext must be used within an AuthProvider');
    }

    const { user } = context;
    if (!user || user.role !== 'admin') {
      setError('Access denied: Only admins can record car entries');
      return;
    }

    const fetchOptions = async () => {
      try {
        const [vehiclesRes, parkingsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/vehicles/all', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:3001/api/parkings', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setVehicles(vehiclesRes.data.vehicles);
        setParkings(parkingsRes.data.parkings);
      } catch (err: any) {
        setError('Failed to fetch options');
      }
    };
    fetchOptions();
  }, [context]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post<ResponseData>(
        'http://localhost:3001/api/records/entry',
        {
          vehicleId: formData.vehicleId,
          parkingId: formData.parkingId,
          entryDateTime: formData.entryDateTime
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const ticketNumber = response.data.ticket.ticketNumber;
      setSuccess(`Car entry recorded successfully! Ticket Number: ${ticketNumber}`);
      setError('');
      setFormData({ vehicleId: '', parkingId: '', entryDateTime: '' }); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record car entry');
      setSuccess('');
    }
  };

  if (error && (!context?.user || context.user.role !== 'admin')) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Car Entry</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="vehicleId">
              Vehicle
            </label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} ({vehicle.user.firstName} {vehicle.user.lastName})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="parkingId">
              Parking
            </label>
            <select
              id="parkingId"
              name="parkingId"
              value={formData.parkingId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a parking</option>
              {parkings.map(parking => (
                <option key={parking.id} value={parking.id}>
                  {parking.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="entryDateTime">
              Entry Date and Time
            </label>
            <input
              type="datetime-local"
              id="entryDateTime"
              name="entryDateTime"
              value={formData.entryDateTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Record Entry
          </button>
        </form>
      </div>
    </div>
  );
}

export default CarEntry;