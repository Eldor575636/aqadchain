import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contractsAPI, vehiclesAPI } from '../utils/api';
import { AuthNavbar } from '../components/Navbar';
import { ContractStatusBadge } from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import DRMContractViewer from '../components/DRMContractViewer';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value || '—'}</span>
    </div>
  );
}

function money(v) {
  if (v == null) return '—';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [certifiedCopyModal, setCertifiedCopyModal] = useState(false);
  const [tab, setTab] = useState('details'); // 'details' | 'contract'
  const [contractHtml, setContractHtml] = useState(null);
  const [fuelEconomy, setFuelEconomy] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);

  const load = () => {
    setLoading(true);
    contractsAPI.get(id)
      .then(({ data }) => { setContract(data.contract); setAuditLogs(data.auditLogs || []); })
      .catch(() => navigate('/contracts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  // Done-deal extras: fuel economy + stock photo, only for signed/completed contracts
  useEffect(() => {
    if (!contract) return;
    if (contract.status !== 'SIGNED' && contract.status !== 'COMPLETED') return;
    if (!contract.vehicle_year || !contract.vehicle_make || !contract.vehicle_model) return;

    vehiclesAPI.fuelEconomy(contract.vehicle_year, contract.vehicle_make, contract.vehicle_model)
      .then(({ data }) => { if (data.found) setFuelEconomy(data); })
      .catch(() => {});

    vehiclesAPI.photo(contract.vehicle_year, contract.vehicle_make, contract.vehicle_model)
      .then(({ data }) => { if (data.found) setVehiclePhoto(data); })
      .catch(() => {});
  }, [contract]);

  const handleSend = async () => {
    setActionLoading(true);
    try {
      await contractsAPI.send(id);
      toast.success('Contract sent for signature!');
      setSendModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await contractsAPI.delete(id);
      toast.success('Contract cancelled');
      navigate('/contracts');
    } catch (err) {
      toast.error(err.message);
    } finally { setActionLoading(false); }
  };

  const handleResend = async () => {
    setActionLoading(true);
    try {
      await contractsAPI.resend(id);
      toast.success('Signature request resent');
    } catch (err) {
      toast.error(err.message);
    } finally { setActionLoading(false); }
  };

  const handleDownload = async () => {
    setActionLoading(true);
    try {
      const { data } = await contractsAPI.download(id);
      window.open(data.url, '_blank');
    } catch (err) {
      toast.error(err.message);
    } finally { setActionLoading(false); }
  };

  const handleViewContract = async () => {
    const next = tab === 'contract' ? 'details' : 'contract';
    setTab(next);
    if (next === 'contract' && !contractHtml) {
      try {
        const { data } = await contractsAPI.preview(id);
        setContractHtml(data.html);
      } catch {
        toast.error('Could not load contract preview');
        setTab('details');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100"><AuthNavbar />
      <div className="flex justify-center pt-24"><Spinner size="lg" /></div>
    </div>
  );

  if (!contract) return null;

  const c = contract;

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/contracts" className="text-sm text-gray-500 hover:text-teal-600 mb-1 block">← Back to Contracts</Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-heading text-gray-900">{c.contract_number}</h1>
              <ContractStatusBadge status={c.status} />
            </div>
            <p className="text-gray-500 text-sm mt-1">{c.contract_type} · Created {format(new Date(c.created_at), 'MMM d, yyyy')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={handleViewContract}>
              {tab === 'contract' ? '← Details' : '📄 View Contract'}
            </Button>
            {c.status === 'DRAFT' && (
              <>
                <Button variant="secondary" onClick={() => navigate(`/contracts/new/type?edit=${c.id}`)}>Edit</Button>
                <Button onClick={() => setSendModal(true)}>Send for Signature</Button>
                <Button variant="danger" onClick={() => setDeleteModal(true)}>Delete</Button>
              </>
            )}
            {c.status === 'PENDING_SIGNATURE' && (
              <Button variant="secondary" loading={actionLoading} onClick={handleResend}>Resend Signature Email</Button>
            )}
            {(c.status === 'SIGNED' || c.status === 'COMPLETED') && (
              <>
                <Button variant="secondary" onClick={() => setCertifiedCopyModal(true)}>Certified Copy — $4.99</Button>
                <Button loading={actionLoading} onClick={handleDownload}>Download PDF</Button>
              </>
            )}
          </div>
        </div>

        {tab === 'contract' && contractHtml && (
          <div className="mb-6">
            <DRMContractViewer htmlContent={contractHtml} contractNumber={c.contract_number} />
          </div>
        )}

        {tab === 'contract' && !contractHtml && (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        )}

        <div className={`grid md:grid-cols-3 gap-6 ${tab === 'contract' ? 'hidden' : ''}`}>
          <div className="md:col-span-2 space-y-6">

            {/* Vehicle */}
            <Card header="Vehicle">
              {vehiclePhoto && (
                <div className="mb-4 -mt-2 rounded-card overflow-hidden">
                  <img src={vehiclePhoto.url} alt={`${c.vehicle_year} ${c.vehicle_make} ${c.vehicle_model}`} className="w-full h-48 object-cover" />
                  {vehiclePhoto.credit_name && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Photo by{' '}
                      <a href={vehiclePhoto.credit_url} target="_blank" rel="noreferrer" className="underline">{vehiclePhoto.credit_name}</a>
                      {' '}on Unsplash
                    </p>
                  )}
                </div>
              )}
              <DetailRow label="VIN" value={c.vehicle_vin} />
              <DetailRow label="Year / Make / Model" value={`${c.vehicle_year || ''} ${c.vehicle_make || ''} ${c.vehicle_model || ''}`.trim() || '—'} />
              <DetailRow label="Trim" value={c.vehicle_trim} />
              <DetailRow label="Mileage" value={c.vehicle_mileage != null ? `${Number(c.vehicle_mileage).toLocaleString()} miles` : null} />
              <DetailRow label="Color" value={c.vehicle_color} />
              <DetailRow label="Title Status" value={c.title_status} />
              {fuelEconomy && (
                <>
                  <DetailRow label="Fuel Economy" value={`${fuelEconomy.combined_mpg} MPG combined (${fuelEconomy.city_mpg} city / ${fuelEconomy.highway_mpg} hwy)`} />
                  <DetailRow label="Fuel Type" value={fuelEconomy.fuel_type} />
                  <DetailRow label="Annual Fuel Cost (est.)" value={fuelEconomy.annual_fuel_cost ? `$${fuelEconomy.annual_fuel_cost}` : null} />
                </>
              )}
            </Card>

            {/* Parties */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card header={c.contract_type === 'IJARAH' ? 'Lessor (Owner)' : 'Seller'}>
                <DetailRow label="Name" value={c.seller_name} />
                <DetailRow label="Email" value={c.seller_email} />
                <DetailRow label="Phone" value={c.seller_phone} />
                <DetailRow label="Address" value={c.seller_address} />
              </Card>
              <Card header={c.contract_type === 'IJARAH' ? 'Lessee (Renter)' : 'Buyer'}>
                <DetailRow label="Name" value={c.buyer_name} />
                <DetailRow label="Email" value={c.buyer_email} />
                <DetailRow label="Phone" value={c.buyer_phone} />
                <DetailRow label="Address" value={c.buyer_address} />
              </Card>
            </div>

            {/* Deal Terms */}
            <Card header={c.contract_type === 'IJARAH' ? 'Lease Terms' : 'Deal Terms'}>
              {c.contract_type === 'IJARAH' ? (
                <>
                  <DetailRow label="Ijarah Type" value={c.ijarah_subtype === 'IMIT' ? 'IMIT (Lease-to-Own)' : 'Operating Lease'} />
                  <DetailRow label="Asset Value" value={money(c.car_price)} />
                  <DetailRow label="Security Deposit" value={money(c.security_deposit)} />
                  {c.ijarah_subtype === 'IMIT' && <DetailRow label="Residual / Buyout Value" value={money(c.residual_value)} />}
                  <DetailRow label="Lease Term" value={c.term_months ? `${c.term_months} months` : null} />
                  <DetailRow label="Rental Frequency" value={c.payment_frequency} />
                  <DetailRow label="Rental Payment (Ujrah)" value={money(c.monthly_payment)} />
                  <DetailRow label="Total Payable" value={money(c.total_payable)} />
                  <DetailRow label="First Rental Date" value={c.payment_start_date ? format(new Date(c.payment_start_date), 'MMM d, yyyy') : null} />
                  <DetailRow label="Late Fee (daily)" value={money(c.late_fee_amount)} />
                  <DetailRow label="Charity" value={c.charity_name} />
                </>
              ) : (
                <>
                  <DetailRow label="Car Price" value={money(c.car_price)} />
                  <DetailRow label="Down Payment" value={money(c.down_payment)} />
                  <DetailRow label="Amount Financed" value={money(c.financed_amount)} />
                  <DetailRow label="Markup" value={c.markup_percentage != null ? `${c.markup_percentage}% (${money(c.markup_amount)})` : null} />
                  <DetailRow label="APR" value={c.apr != null ? `${c.apr}%` : null} />
                  <DetailRow label="Term" value={c.term_months ? `${c.term_months} months` : null} />
                  <DetailRow label="Payment Frequency" value={c.payment_frequency} />
                  <DetailRow label="Payment Amount" value={money(c.monthly_payment)} />
                  <DetailRow label="Total Payable" value={money(c.total_payable)} />
                  <DetailRow label="Payment Start" value={c.payment_start_date ? format(new Date(c.payment_start_date), 'MMM d, yyyy') : null} />
                  <DetailRow label="Late Fee (daily)" value={money(c.late_fee_amount)} />
                  <DetailRow label="Charity" value={c.charity_name} />
                </>
              )}
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Signature Status */}
            <Card header="Signature Status">
              <div className="space-y-3">
                {[
                  { role: c.contract_type === 'IJARAH' ? 'Lessor' : 'Seller', name: c.seller_name, signed_at: c.seller_signed_at },
                  { role: c.contract_type === 'IJARAH' ? 'Lessee' : 'Buyer', name: c.buyer_name, signed_at: c.buyer_signed_at },
                ].map((s) => (
                  <div key={s.role} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.role}</p>
                      <p className="text-xs text-gray-500">{s.name || '—'}</p>
                    </div>
                    {s.signed_at
                      ? <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Signed</span>
                      : <span className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-0.5 rounded-full">Pending</span>
                    }
                  </div>
                ))}
              </div>
            </Card>

            {/* Audit Log */}
            <Card header="Activity Log">
              {auditLogs.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
                : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-400">{format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </Card>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      <Modal isOpen={sendModal} onClose={() => setSendModal(false)} title="Send for Signature"
        footer={<div className="flex gap-2 justify-end"><Button variant="ghost" onClick={() => setSendModal(false)}>Cancel</Button><Button loading={actionLoading} onClick={handleSend}>Send Contract</Button></div>}>
        <p className="text-gray-600 text-sm mb-4">This will send DocuSign signature requests to:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-3 bg-gray-50 rounded"><span className="text-gray-500">Seller</span><span className="font-medium">{c.seller_email}</span></div>
          <div className="flex justify-between p-3 bg-gray-50 rounded"><span className="text-gray-500">Buyer</span><span className="font-medium">{c.buyer_email}</span></div>
        </div>
        <Alert variant="info" className="mt-4">The seller will sign first, then the buyer will receive their signing link.</Alert>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Cancel Contract"
        footer={<div className="flex gap-2 justify-end"><Button variant="ghost" onClick={() => setDeleteModal(false)}>Keep it</Button><Button variant="danger" loading={actionLoading} onClick={handleDelete}>Yes, cancel contract</Button></div>}>
        <p className="text-gray-600 text-sm">This will cancel the contract. This action cannot be undone.</p>
      </Modal>

      {/* Certified Copy Modal */}
      <Modal isOpen={certifiedCopyModal} onClose={() => setCertifiedCopyModal(false)} title="Get Certified Copy"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCertifiedCopyModal(false)}>Cancel</Button>
            <Button loading={actionLoading} onClick={async () => { setCertifiedCopyModal(false); await handleDownload(); }}>
              Pay $4.99 &amp; Download
            </Button>
          </div>
        }>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg border border-teal-100">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-lg">📜</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Certified PDF Copy</p>
              <p className="text-gray-500 text-xs">Contract {c.contract_number} · One-time download</p>
            </div>
            <span className="ml-auto text-lg font-bold text-teal-700">$4.99</span>
          </div>
          <p className="text-sm text-gray-600">
            Your certified copy includes a tamper-evident digital signature, the full payment schedule, and is suitable for insurance, DMV, or legal purposes.
          </p>
          <Alert variant="info">
            This is a one-time add-on. Your contract remains securely viewable in-platform at no extra charge.
          </Alert>
        </div>
      </Modal>
    </div>
  );
}
