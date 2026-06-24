import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contractsAPI } from '../utils/api';
import { useUser } from '../hooks/useUser';
import { AuthNavbar } from '../components/Navbar';
import { ContractStatusBadge } from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { format } from 'date-fns';

function StatCard({ label, value, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <div className={`rounded-card border p-5 ${colors[color]}`}>
      <p className="text-2xl font-extrabold font-heading">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { dbUser } = useUser();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, signed: 0, drafts: 0, pending: 0, cancelled: 0 });

  useEffect(() => {
    contractsAPI.list({ limit: 5 }).then(({ data }) => {
      setContracts(data.contracts);
      const all = data.contracts;
      setStats({
        total: data.total,
        signed: all.filter((c) => c.status === 'SIGNED' || c.status === 'COMPLETED').length,
        drafts: all.filter((c) => c.status === 'DRAFT').length,
        pending: all.filter((c) => c.status === 'PENDING_SIGNATURE').length,
        cancelled: all.filter((c) => c.status === 'CANCELLED').length,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">
              Welcome back, {dbUser?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's an overview of your contracts</p>
          </div>
          <Button onClick={() => navigate('/contracts/new/type')}>+ New Contract</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Contracts" value={stats.total} color="gray" />
          <StatCard label="Signed" value={stats.signed} color="green" />
          <StatCard label="Pending Signature" value={stats.pending} color="yellow" />
          <StatCard label="Drafts" value={stats.drafts} color="teal" />
        </div>

        {/* Recent contracts */}
        <Card header={
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">Recent Contracts</span>
            <Link to="/contracts" className="text-sm text-teal-600 hover:underline font-medium">View all →</Link>
          </div>
        } padding={false}>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : contracts.length === 0 ? (
            <EmptyState
              title="No contracts yet"
              description="Create your first Halal vehicle financing contract to get started."
              action={() => navigate('/contracts/new/type')}
              actionLabel="Create your first contract"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contract #</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Buyer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{c.contract_number}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {c.vehicle_year && c.vehicle_make ? `${c.vehicle_year} ${c.vehicle_make} ${c.vehicle_model || ''}`.trim() : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{c.buyer_name || '—'}</td>
                      <td className="px-6 py-4"><ContractStatusBadge status={c.status} /></td>
                      <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{format(new Date(c.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4">
                        <Link to={`/contracts/${c.id}`} className="text-teal-600 hover:underline text-xs font-medium">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
