import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../hooks/useUser';
import { listingsAPI, messagesAPI } from '../utils/api';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import Alert from '../components/Alert';
import { toast } from 'react-toastify';

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

function Stars({ rating }) {
  const full = Math.round(rating);
  return <span className="text-amber-400">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>;
}

function SimilarListings({ id }) {
  const [similar, setSimilar] = useState([]);
  useEffect(() => {
    listingsAPI.similar(id).then(({ data }) => setSimilar(data.listings)).catch(() => {});
  }, [id]);
  if (similar.length === 0) return null;
  return (
    <Card header="Similar Listings">
      <div className="grid grid-cols-2 gap-3">
        {similar.map((l) => (
          <Link key={l.id} to={`/marketplace/${l.id}`} className="block p-3 rounded-card border border-gray-100 hover:border-teal-300 transition-colors">
            <p className="text-sm font-medium text-gray-900 truncate">{l.vehicle_year} {l.vehicle_make} {l.vehicle_model}</p>
            <p className="text-teal-600 text-sm font-bold">{money(l.asking_price)}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { dbUser } = useUser();
  const [listing, setListing] = useState(null);
  const [sellerRating, setSellerRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    listingsAPI.get(id)
      .then(({ data }) => { setListing(data.listing); setSellerRating(data.seller_rating); setReviewCount(data.seller_review_count); })
      .catch(() => navigate('/marketplace'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    listingsAPI.myFavorites()
      .then(({ data }) => setIsFavorited(data.favorites.some((f) => f.listing_id === id)))
      .catch(() => {});
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) { loginWithRedirect(); return; }
    try {
      const { data } = await listingsAPI.toggleFavorite(id);
      setIsFavorited(data.favorited);
    } catch {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { loginWithRedirect(); return; }
    if (!messageBody.trim()) return;
    setSendingMessage(true);
    try {
      await messagesAPI.send({ listing_id: id, recipient_id: listing.seller.id, body: messageBody.trim() });
      toast.success('Message sent!');
      setMessageBody('');
      navigate(`/messages?listing=${id}&user=${listing.seller.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

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

  const isOwnListing = dbUser?.id === listing.seller?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate('/marketplace')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back to Marketplace</button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card padding={false} className="overflow-hidden relative">
              <button
                onClick={toggleFavorite}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-lg"
                aria-label="Toggle favorite"
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
              <div className="h-72 bg-gray-100">
                {listing.photo_url ? (
                  <img src={listing.photo_url} alt={`${listing.vehicle_year} ${listing.vehicle_make} ${listing.vehicle_model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🚗</div>
                )}
              </div>
            </Card>

            {listing.has_recalls && Array.isArray(listing.recalls) && listing.recalls.length > 0 && (
              <Alert variant="warning" title={`⚠ ${listing.recalls.length} active recall(s) on this vehicle`}>
                {listing.recalls.slice(0, 2).map((r, i) => (
                  <div key={i} className="mt-1 text-xs">{r.component}: {r.summary?.slice(0, 120)}…</div>
                ))}
              </Alert>
            )}

            <Card header="Vehicle Details">
              <DetailRow label="VIN" value={listing.vehicle_vin} />
              <DetailRow label="Year / Make / Model" value={`${listing.vehicle_year} ${listing.vehicle_make} ${listing.vehicle_model}`} />
              <DetailRow label="Trim" value={listing.vehicle_trim} />
              <DetailRow label="Mileage" value={listing.vehicle_mileage ? `${Number(listing.vehicle_mileage).toLocaleString()} miles` : null} />
              <DetailRow label="Color" value={listing.vehicle_color} />
              <DetailRow label="Title Status" value={listing.title_status} />
              <DetailRow label="Location" value={[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')} />
            </Card>

            {listing.description && (
              <Card header="Description">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </Card>
            )}

            <SimilarListings id={id} />
          </div>

          <div className="space-y-6">
            <Card>
              <Badge variant={typeColors[listing.contract_type_offered]} className="mb-3">{typeLabels[listing.contract_type_offered]}</Badge>
              <p className="text-3xl font-extrabold font-heading text-gray-900 mb-1">{money(listing.asking_price)}</p>
              <p className="text-sm text-gray-500 mb-5">Asking price · {listing.contract_type_offered === 'IJARAH' ? 'lease structure' : 'sale structure'}</p>
              {!isOwnListing && (
                <Button onClick={handleStartDeal} className="w-full mb-3">Start This Deal →</Button>
              )}
              <p className="text-xs text-gray-400 text-center">You'll review and customize terms before signing. Nothing is final yet.</p>
            </Card>

            <Card header="Seller">
              <p className="font-medium text-gray-900">{listing.seller?.full_name || 'AqadChain Member'}</p>
              {listing.seller?.kyc_status === 'VERIFIED' && (
                <Badge variant="success" className="mt-2">✓ Identity Verified</Badge>
              )}
              {sellerRating != null ? (
                <p className="text-sm mt-2"><Stars rating={sellerRating} /> <span className="text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span></p>
              ) : (
                <p className="text-xs text-gray-400 mt-2">No reviews yet</p>
              )}
              <p className="text-xs text-gray-400 mt-3">Full contact details are shared once you start a deal.</p>
            </Card>

            {!isOwnListing && (
              <Card header="Message Seller">
                <form onSubmit={handleSendMessage}>
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Ask a question about this vehicle…"
                    className="input mb-3"
                    rows={3}
                  />
                  <Button type="submit" loading={sendingMessage} disabled={!messageBody.trim()} className="w-full">Send Message</Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
