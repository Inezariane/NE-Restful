import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface Report {
  id: string;
  vehicle: { plateNumber: string };
  parking: { name: string };
  entryDateTime: string;
  exitDateTime: string | null;
  chargedAmount: number | null;
}

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [startDate, setStartDate] = useState<string>('2025-05-20T00:00'); 
  const [endDate, setEndDate] = useState<string>('2025-05-20T13:55'); 
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const context = useContext(AuthContext);

  const currentDateTime = new Date('2025-05-20T13:55:00+02:00'); 

  const fetchReports = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    try {
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      const response = await axios.get(
        `http://localhost:3001/api/reports/entries?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch reports');
      setReports([]);
    }
  };

  const handleFilter = () => {
    if (new Date(startDate) > currentDateTime || new Date(endDate) > currentDateTime) {
      setError('Dates cannot be in the future');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }
    setError('');
    setPage(1); 
    setIsFiltered(true);
    fetchReports();
  };

  if (!context) throw new Error('AuthContext must be used within an AuthProvider');
  const { user } = context;
  if (!user || user.role !== 'admin') return <p className="text-red-500 text-center">Access denied: Only admins can view reports</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4 flex space-x-4">
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          max={currentDateTime.toISOString().slice(0, 16)}
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          max={currentDateTime.toISOString().slice(0, 16)}
        />
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Filter
        </button>
      </div>
      {isFiltered && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Vehicle</th>
                <th className="py-2 px-4">Parking</th>
                <th className="py-2 px-4">Entry Time</th>
                <th className="py-2 px-4">Exit Time</th>
                <th className="py-2 px-4">Charged Amount</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-t">
                  <td className="py-2 px-4">{report.vehicle.plateNumber}</td>
                  <td className="py-2 px-4">{report.parking.name}</td>
                  <td className="py-2 px-4">{new Date(report.entryDateTime).toLocaleString()}</td>
                  <td className="py-2 px-4">{report.exitDateTime ? new Date(report.exitDateTime).toLocaleString() : 'N/A'}</td>
                  <td className="py-2 px-4">${report.chargedAmount || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => {
                setPage(prev => Math.max(1, prev - 1));
                fetchReports();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => {
                setPage(prev => (prev < totalPages ? prev + 1 : prev));
                fetchReports();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;