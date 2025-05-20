import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface Parking {
  id: string;
  code: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  location: string;
  feePerHour: number;
}

function ParkingList() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const context = useContext(AuthContext);

  useEffect(() => {
    if (!context) throw new Error('AuthContext must be used within an AuthProvider');
    const fetchParkings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/parkings?page=${page}&limit=10`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setParkings(response.data.parkings);
        setTotalPages(response.data.totalPages);
      } catch (err: any) {
        setError('Failed to fetch parkings');
      }
    };
    fetchParkings();
  }, [context, page]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Available Parkings</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Code</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Available Spaces</th>
              <th className="py-2 px-4">Location</th>
              <th className="py-2 px-4">Fee/Hour</th>
            </tr>
          </thead>
          <tbody>
            {parkings.map(parking => (
              <tr key={parking.id} className="border-t">
                <td className="py-2 px-4">{parking.code}</td>
                <td className="py-2 px-4">{parking.name}</td>
                <td className="py-2 px-4">{parking.availableSpaces}/{parking.totalSpaces}</td>
                <td className="py-2 px-4">{parking.location}</td>
                <td className="py-2 px-4">${parking.feePerHour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : prev))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ParkingList;