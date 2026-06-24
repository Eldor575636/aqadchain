import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-extrabold text-teal-500 font-heading">404</p>
        <h1 className="text-2xl font-bold text-gray-900 font-heading mt-4 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
