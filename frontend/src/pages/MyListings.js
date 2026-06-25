import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingsAPI } from '../utils/api';
import { AuthNavbar } from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import { toast } from 'react-toastify';

const statusVariant = { ACTIVE: 'success', PENDING: 'pending', SOLD: 'info', REMOVED: 'default' };

function money(v) {
  return `$${Number(v).toLocaleString()}`;
}

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    listingsAPI.mine().then(({ data }) => setListings(data.listings)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markSold = async (id) => {
    try {
      await listingsAPI.setStatus(id, 'SOLD');
      toast.success('Marked as sold');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing removed');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading text-gray-900">My Listings</h1>
          <Button onClick={() => navigate('/marketplace/sell')}>+ New Listing</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : listings.length === 0 ? (
          <EmptyState title="No listings yet" description="List a vehicle to reach halal-financing buyers." action={() => navigate('/marketplace/sell')} actionLabel="List your vehicle" />
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <Card key={l.id}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statusVariant[l.status]}>{l.status}</Badge>
                      <span className="text-xs text-gray-400">{l.views} view{l.views !== 1 ? 's' : ''}</span>
                    </div>
                    <Link to={`/marketplace/${l.id}`} className="font-semibold text-gray-900 hover:text-teal-600">
                      {l.vehicle_year} {l.vehicle_make} {l.vehicle_model}
                    </Link>
                    <p className="text-teal-600 font-bold">{money(l.asking_price)}</p>
                  </div>
                  <div className="flex gap-2">
                    {l.status === 'ACTIVE' && (
                      <Button size="sm" variant="secondary" onClick={() => markSold(l.id)}>Mark Sold</Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => remove(l.id)}>Remove</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
