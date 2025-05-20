import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface FormData {
  ticketNumber: string;
  exitDateTime: string;
}

function CarExit() {
  const [formData, setFormData] = useState<FormData>({
    ticketNumber: '',
    exitDateTime: ''
  });
  const [error, setError] = useState<string>('');
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const currentDateTime = new Date('2025-05-20T12:40:00+02:00'); // Current time: 12:40 PM CAT, May 20, 2025

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const exitTime = new Date(formData.exitDateTime);
    if (exitTime > currentDateTime) {
      setError('Exit time cannot be in the future');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:3001/api/records/exit',
        {
          ticketNumber: formData.ticketNumber,
          exitDateTime: formData.exitDateTime
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/records/exit');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record car exit');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Car Exit</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="ticketNumber">
              Ticket Number
            </label>
            <input
              type="text"
              id="ticketNumber"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ticket number"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="exitDateTime">
              Exit Date and Time
            </label>
            <input
              type="datetime-local"
              id="exitDateTime"
              name="exitDateTime"
              value={formData.exitDateTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              max={currentDateTime.toISOString().slice(0, 16)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Record Exit
          </button>
        </form>
      </div>
    </div>
  );
}

export default CarExit