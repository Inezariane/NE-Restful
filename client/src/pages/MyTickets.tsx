import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface Ticket {
  id: string;
  ticketNumber: string;
  entryDateTime: string;
  exitDateTime: string | null;
  chargedAmount: number | null;
  vehicle: { plateNumber: string };
  parking: { name: string };
}

function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const context = useContext(AuthContext);

  useEffect(() => {
    if (!context) throw new Error('AuthContext must be used within an AuthProvider');
    const { user } = context;
    if (!user || user.role !== 'user') {
      setError('Access denied: Only users can view their tickets');
      return;
    }
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/records/my-tickets?page=${page}&limit=10`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setTickets(response.data.tickets);
        setTotalPages(response.data.totalPages);
      } catch (err: any) {
        setError('Failed to fetch tickets');
      }
    };
    fetchTickets();
  }, [context, page]);

  if (error && (!context?.user || context.user.role !== 'user')) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4">Ticket Number</th>
              <th className="py-2 px-4">Vehicle</th>
              <th className="py-2 px-4">Parking</th>
              <th className="py-2 px-4">Entry Time</th>
              <th className="py-2 px-4">Exit Time</th>
              <th className="py-2 px-4">Charged Amount</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-t">
                <td className="py-2 px-4">{ticket.ticketNumber}</td>
                <td className="py-2 px-4">{ticket.vehicle.plateNumber}</td>
                <td className="py-2 px-4">{ticket.parking.name}</td>
                <td className="py-2 px-4">{new Date(ticket.entryDateTime).toLocaleString()}</td>
                <td className="py-2 px-4">{ticket.exitDateTime ? new Date(ticket.exitDateTime).toLocaleString() : 'N/A'}</td>
                <td className="py-2 px-4">RWF{ticket.chargedAmount || 'N/A'}</td>
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

export default MyTickets;