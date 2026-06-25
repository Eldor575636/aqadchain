import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { listingsAPI } from '../utils/api';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import { Select } from '../components/Input';
import Badge from '../components/Badge';

const typeColors = { MURABAHA: 'success', MUSAWAMA: 'info', IJARAH: 'pending' };
const typeLabels = { MURABAHA: 'Murabaha', MUSAWAMA: 'Musawama', IJARAH: 'Ijarah Lease' };

function money(v) {
  return `$${Number(v).toLocaleString()}`;
}

function ListingCard({ listing }) {
  return (
    <Link to={`/marketplace/${listing.id}`} className="block">
      <Card padding={false} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="h-44 bg-gray-100 overflow-hidden">
          {listing.photo_url ? (
            <img src={listing.photo_url} alt={`${listing.vehicle_year} ${listing.vehicle_make} ${listing.vehicle_model}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🚗</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <Badge variant={typeColors[listing.contract_type_offered]}>{typeLabels[listing.contract_type_offered]}</Badge>
            {(listing.city || listing.state) && (
              <span className="text-xs text-gray-400">{[listing.city, listing.state].filter(Boolean).join(', ')}</span>
            )}
          </div>
          <p className="font-semibold text-gray-900 mt-1">
            {listing.vehicle_year} {listing.vehicle_make} {listing.vehicle_model}
          </p>
          <p className="text-xs text-gray-500 mb-2">{listing.vehicle_trim} {listing.vehicle_mileage ? `· ${Number(listing.vehicle_mileage).toLocaleString()} mi` : ''}</p>
          <p className="text-teal-600 font-bold text-lg">{money(listing.asking_price)}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [make, setMake] = useState('');
  const [contractType, setContractType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    listingsAPI.browse({
      page, limit: 24,
      search: search || undefined,
      make: make || undefined,
      contract_type: contractType || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
    })
      .then(({ data }) => { setListings(data.listings); setTotal(data.total); setPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, make, contractType, minPrice, maxPrice]);

  useEffect(() => { load(); }, [load]);

  const handleSell = () => {
    if (!isAuthenticated) { loginWithRedirect(); return; }
    navigate('/marketplace/sell');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full mb-4">🔥 Now live</span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading mb-2">The Halal Vehicle Marketplace</h1>
          <p className="text-teal-50 max-w-xl mx-auto mb-6">Browse vehicles for sale or lease. Every deal closes with a Shariah-compliant contract — Murabaha, Musawama, or Ijarah.</p>
          <Button variant="secondary" onClick={handleSell} className="bg-white text-teal-700 hover:bg-teal-50">+ List Your Vehicle</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Input placeholder="Search make, model…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="col-span-2 md:col-span-1" />
          <Input placeholder="Make" value={make} onChange={(e) => { setMake(e.target.value); setPage(1); }} />
          <Select value={contractType} onChange={(e) => { setContractType(e.target.value); setPage(1); }}>
            <option value="">All contract types</option>
            <option value="MURABAHA">Murabaha</option>
            <option value="MUSAWAMA">Musawama</option>
            <option value="IJARAH">Ijarah Lease</option>
          </Select>
          <Input type="number" placeholder="Min price" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} />
          <Input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : listings.length === 0 ? (
          <EmptyState title="No listings found" description="Try adjusting your filters, or be the first to list a vehicle." action={handleSell} actionLabel="List your vehicle" />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} listing{total !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</Button>
                <span className="text-sm text-gray-600 px-3 py-1.5">{page} / {pages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === pages}>Next →</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
