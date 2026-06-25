import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../utils/api';
import { AuthNavbar } from '../components/Navbar';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';

const typeColors = { MURABAHA: 'success', MUSAWAMA: 'info', IJARAH: 'pending' };
const typeLabels = { MURABAHA: 'Murabaha', MUSAWAMA: 'Musawama', IJARAH: 'Ijarah Lease' };

function money(v) {
  return `$${Number(v).toLocaleString()}`;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsAPI.myFavorites().then(({ data }) => setFavorites(data.favorites)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">My Favorites</h1>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : favorites.length === 0 ? (
          <EmptyState title="No favorites yet" description="Browse the marketplace and tap the heart on listings you like." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map(({ listing }) => (
              <Link key={listing.id} to={`/marketplace/${listing.id}`}>
                <Card padding={false} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    {listing.photo_url ? (
                      <img src={listing.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">🚗</div>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant={typeColors[listing.contract_type_offered]}>{typeLabels[listing.contract_type_offered]}</Badge>
                    <p className="font-semibold text-gray-900 mt-1">{listing.vehicle_year} {listing.vehicle_make} {listing.vehicle_model}</p>
                    <p className="text-teal-600 font-bold">{money(listing.asking_price)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
