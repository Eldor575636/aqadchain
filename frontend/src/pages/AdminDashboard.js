import { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api';
import { AuthNavbar } from '../components/Navbar';
import { ContractStatusBadge } from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function StatBox({ label, value }) {
  return (
    <div className="bg-white rounded-card border border-gray-200 p-5">
      <p className="text-3xl font-extrabold font-heading text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers(), adminAPI.getContracts()])
      .then(([s, u, c]) => {
        setStats(s.data);
        setUsers(u.data.users);
        setContracts(c.data.contracts);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleKyc = async (userId, status) => {
    try {
      await adminAPI.updateKyc(userId, status);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, kyc_status: status } : u));
      toast.success(`KYC ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100"><AuthNavbar /><div className="flex justify-center pt-24"><Spinner size="lg" /></div></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Users" value={stats?.totalUsers} />
          <StatBox label="Total Contracts" value={stats?.totalContracts} />
          <StatBox label="Signed Today" value={stats?.signedToday} />
          <StatBox label="Pending Signature" value={stats?.pendingSignature} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {['users', 'contracts'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${tab === t ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Email', 'Role', 'KYC Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.full_name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">{u.role}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : u.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {u.kyc_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4">
                        {u.kyc_status !== 'VERIFIED' && <button onClick={() => handleKyc(u.id, 'VERIFIED')} className="text-xs text-green-600 hover:underline mr-3">Verify</button>}
                        {u.kyc_status !== 'REJECTED' && <button onClick={() => handleKyc(u.id, 'REJECTED')} className="text-xs text-red-600 hover:underline">Reject</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'contracts' && (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Contract #', 'Type', 'Creator', 'Buyer', 'Amount', 'Status', 'Created'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{c.contract_number}</td>
                      <td className="px-6 py-4 text-xs font-semibold">{c.contract_type}</td>
                      <td className="px-6 py-4 text-gray-600">{c.creator?.full_name}</td>
                      <td className="px-6 py-4 text-gray-600">{c.buyer_name || '—'}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{c.financed_amount ? `$${Number(c.financed_amount).toLocaleString()}` : '—'}</td>
                      <td className="px-6 py-4"><ContractStatusBadge status={c.status} /></td>
                      <td className="px-6 py-4 text-gray-500">{format(new Date(c.created_at), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
