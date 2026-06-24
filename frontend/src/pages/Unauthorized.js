import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-extrabold text-red-400 font-heading">401</p>
        <h1 className="text-2xl font-bold text-gray-900 font-heading mt-4 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">You don't have permission to view this page.</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
}
