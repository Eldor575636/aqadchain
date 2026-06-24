import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contractsAPI } from '../utils/api';
import { AuthNavbar } from '../components/Navbar';
import { ContractStatusBadge } from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import { Select } from '../components/Input';
import { format } from 'date-fns';

const STATUSES = ['ALL', 'DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'COMPLETED', 'CANCELLED'];

export default function ContractsList() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const load = useCallback(() => {
    setLoading(true);
    contractsAPI.list({ page, limit: 20, search: search || undefined, status: status !== 'ALL' ? status : undefined })
      .then(({ data }) => {
        setContracts(data.contracts);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading text-gray-900">Contracts</h1>
          <Button onClick={() => navigate('/contracts/new/type')}>+ New Contract</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input
            placeholder="Search by contract #, buyer, or vehicle…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1"
          />
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="sm:w-48">
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s.replace('_', ' ')}</option>)}
          </Select>
        </div>

        <Card padding={false}>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : contracts.length === 0 ? (
            <EmptyState
              title="No contracts found"
              description={search || status !== 'ALL' ? 'Try adjusting your search or filters.' : 'Create your first contract to get started.'}
              action={search || status !== 'ALL' ? undefined : () => navigate('/contracts/new/type')}
              actionLabel="Create a contract"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contract #</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Vehicle</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Buyer</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/contracts/${c.id}`)}>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{c.contract_number}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">{c.contract_type}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium hidden md:table-cell">
                          {c.vehicle_year ? `${c.vehicle_year} ${c.vehicle_make} ${c.vehicle_model || ''}`.trim() : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{c.buyer_name || '—'}</td>
                        <td className="px-6 py-4"><ContractStatusBadge status={c.status} /></td>
                        <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{format(new Date(c.created_at), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4">
                          <Link to={`/contracts/${c.id}`} className="text-teal-600 hover:underline text-xs font-medium" onClick={(e) => e.stopPropagation()}>View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Showing {contracts.length} of {total} contracts</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</Button>
                    <span className="text-sm text-gray-600 px-3 py-1.5">{page} / {pages}</span>
                    <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === pages}>Next →</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
