import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { listingsAPI } from '../utils/api';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';

const typeColors = { MURABAHA: 'success', MUSAWAMA: 'info', IJARAH: 'pending' };
const typeLabels = { MURABAHA: 'Murabaha', MUSAWAMA: 'Musawama', IJARAH: 'Ijarah Lease' };

function money(v) {
  return `$${Number(v).toLocaleString()}`;
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || '—'}</span>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsAPI.get(id)
      .then(({ data }) => setListing(data.listing))
      .catch(() => navigate('/marketplace'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStartDeal = () => {
    if (!isAuthenticated) { loginWithRedirect(); return; }
    navigate('/contracts/new/type', {
      state: {
        prefill: {
          contract_type: listing.contract_type_offered,
          vehicle_vin: listing.vehicle_vin,
          vehicle_year: listing.vehicle_year,
          vehicle_make: listing.vehicle_make,
          vehicle_model: listing.vehicle_model,
          vehicle_trim: listing.vehicle_trim,
          vehicle_mileage: listing.vehicle_mileage,
          vehicle_color: listing.vehicle_color,
          title_status: listing.title_status,
          car_price: listing.asking_price,
          seller_name: listing.seller?.full_name,
          listing_id: listing.id,
        },
      },
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }
  if (!listing) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate('/marketplace')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back to Marketplace</button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card padding={false} className="overflow-hidden">
              <div className="h-72 bg-gray-100">
                {listing.photo_url ? (
                  <img src={listing.photo_url} alt={`${listing.vehicle_year} ${listing.vehicle_make} ${listing.vehicle_model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🚗</div>
                )}
              </div>
            </Card>

            <Card header="Vehicle Details">
              <DetailRow label="VIN" value={listing.vehicle_vin} />
              <DetailRow label="Year / Make / Model" value={`${listing.vehicle_year} ${listing.vehicle_make} ${listing.vehicle_model}`} />
              <DetailRow label="Trim" value={listing.vehicle_trim} />
              <DetailRow label="Mileage" value={listing.vehicle_mileage ? `${Number(listing.vehicle_mileage).toLocaleString()} miles` : null} />
              <DetailRow label="Color" value={listing.vehicle_color} />
              <DetailRow label="Title Status" value={listing.title_status} />
              <DetailRow label="Location" value={[listing.city, listing.state].filter(Boolean).join(', ')} />
            </Card>

            {listing.description && (
              <Card header="Description">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <Badge variant={typeColors[listing.contract_type_offered]} className="mb-3">{typeLabels[listing.contract_type_offered]}</Badge>
              <p className="text-3xl font-extrabold font-heading text-gray-900 mb-1">{money(listing.asking_price)}</p>
              <p className="text-sm text-gray-500 mb-5">Asking price · {listing.contract_type_offered === 'IJARAH' ? 'lease structure' : 'sale structure'}</p>
              <Button onClick={handleStartDeal} className="w-full mb-3">Start This Deal →</Button>
              <p className="text-xs text-gray-400 text-center">You'll review and customize terms before signing. Nothing is final yet.</p>
            </Card>

            <Card header="Seller">
              <p className="font-medium text-gray-900">{listing.seller?.full_name || 'AqadChain Member'}</p>
              {listing.seller?.kyc_status === 'VERIFIED' && (
                <Badge variant="success" className="mt-2">✓ Identity Verified</Badge>
              )}
              <p className="text-xs text-gray-400 mt-3">Full contact details are shared once you start a deal.</p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
