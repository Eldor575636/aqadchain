import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI } from '../../utils/api';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { toast } from 'react-toastify';

function money(v) {
  if (!v && v !== 0) return '—';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wide text-teal-700 border-b border-teal-100 pb-1 mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value || '—'}</span>
    </div>
  );
}

export default function StepReview({ formData, goToStep }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const buildPayload = () => ({
    ...formData,
    vehicle_year: formData.vehicle_year ? Number(formData.vehicle_year) : null,
    vehicle_mileage: formData.vehicle_mileage ? Number(formData.vehicle_mileage) : null,
    car_price: formData.car_price ? Number(formData.car_price) : null,
    down_payment: formData.down_payment != null ? Number(formData.down_payment) : null,
    markup_percentage: formData.markup_percentage ? Number(formData.markup_percentage) : null,
    markup_amount: formData.markup_amount ? Number(formData.markup_amount) : null,
    financed_amount: formData.financed_amount ? Number(formData.financed_amount) : null,
    apr: formData.apr ? Number(formData.apr) : null,
    term_months: formData.term_months ? Number(formData.term_months) : null,
    monthly_payment: formData.monthly_payment ? Number(formData.monthly_payment) : null,
    total_payable: formData.total_payable ? Number(formData.total_payable) : null,
    late_fee_amount: formData.late_fee_amount ? Number(formData.late_fee_amount) : null,
    payment_start_date: formData.payment_start_date || null,
  });

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const { data } = await contractsAPI.create(buildPayload());
      toast.success('Contract saved as draft');
      navigate(`/contracts/${data.contract.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally { setSaveLoading(false); }
  };

  const handleSendForSignature = async () => {
    setLoading(true);
    try {
      const { data } = await contractsAPI.create(buildPayload());
      await contractsAPI.send(data.contract.id);
      toast.success('Contract created and sent for signature!');
      navigate(`/contracts/${data.contract.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-sm">
      {/* Preview watermark header */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between rounded-t-card">
        <span className="text-sm font-semibold text-amber-700">PREVIEW — Review before sending</span>
        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded font-bold">DRAFT</span>
      </div>

      <div className="p-6 md:p-8">
        <div className="text-center border-b border-gray-100 pb-6 mb-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900">
            {formData.contract_type === 'IJARAH' ? 'VEHICLE IJARAH AGREEMENT' : 'VEHICLE FINANCING AGREEMENT'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {formData.contract_type === 'MURABAHA' ? 'Murabaha (Cost-Plus)' : formData.contract_type === 'MUSAWAMA' ? 'Musawama (Negotiated)' : formData.ijarah_subtype === 'IMIT' ? 'Ijarah Muntahia Bittamleek (IMIT)' : 'Ijarah (Operating Lease)'} — Shariah-Compliant
          </p>
        </div>

        <div className={`border-l-4 p-4 rounded-r text-sm mb-6 ${formData.contract_type === 'IJARAH' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-teal-50 border-teal-500 text-teal-800'}`}>
          <strong>Shariah Compliance Declaration:</strong>{' '}
          {formData.contract_type === 'IJARAH'
            ? `This contract is structured as an Ijarah (Islamic lease) per AAOIFI Shari'ah Standard No. 9. The Lessor retains ownership. Rental payments represent compensation for usufruct only. No Riba (interest) is charged.`
            : `This contract is structured as a ${formData.contract_type === 'MURABAHA' ? 'Murabaha (cost-plus)' : 'Musawama (negotiated price)'} deferred payment sale in accordance with AAOIFI Shari'ah Standards. No Riba (interest) is charged or received.`}
        </div>

        <Section title={formData.contract_type === 'IJARAH' ? 'Lessor (Owner)' : 'Seller'}>
          <Row label="Name" value={formData.seller_name} />
          <Row label="Email" value={formData.seller_email} />
          <Row label="Phone" value={formData.seller_phone} />
          <Row label="Address" value={formData.seller_address} />
        </Section>

        <Section title={formData.contract_type === 'IJARAH' ? 'Lessee (Renter)' : 'Buyer'}>
          <Row label="Name" value={formData.buyer_name} />
          <Row label="Email" value={formData.buyer_email} />
          <Row label="Phone" value={formData.buyer_phone} />
          <Row label="Address" value={formData.buyer_address} />
        </Section>

        <Section title="Vehicle">
          <Row label="VIN" value={formData.vehicle_vin} />
          <Row label="Year / Make / Model" value={`${formData.vehicle_year} ${formData.vehicle_make} ${formData.vehicle_model}`.trim()} />
          <Row label="Trim" value={formData.vehicle_trim} />
          <Row label="Mileage" value={formData.vehicle_mileage ? `${Number(formData.vehicle_mileage).toLocaleString()} miles` : null} />
          <Row label="Color" value={formData.vehicle_color} />
          <Row label="Title Status" value={formData.title_status} />
        </Section>

        {formData.contract_type === 'IJARAH' ? (
          <Section title={`Lease Terms (${formData.ijarah_subtype === 'IMIT' ? 'IMIT — Lease-to-Own' : 'Operating Lease'})`}>
            <Row label="Asset Fair Market Value" value={money(formData.car_price)} />
            <Row label="Security Deposit" value={money(formData.security_deposit)} />
            {formData.ijarah_subtype === 'IMIT' && <Row label="Residual / Buyout Value" value={money(formData.residual_value)} />}
            <Row label="Lease Term" value={`${formData.term_months} months`} />
            <Row label="Rental Frequency" value={formData.payment_frequency} />
            <Row label="Rental Payment (Ujrah)" value={money(formData.monthly_payment)} />
            <Row label="Total Payable" value={money(formData.total_payable)} />
            <Row label="First Rental Date" value={formData.payment_start_date} />
          </Section>
        ) : (
          <Section title={formData.contract_type === 'MURABAHA' ? 'Pricing (Murabaha — Cost Disclosed)' : 'Pricing (Musawama — Negotiated)'}>
            <Row label={formData.contract_type === 'MURABAHA' ? 'Purchase/Cost Price' : 'Agreed Selling Price'} value={money(formData.car_price)} />
            <Row label="Down Payment" value={money(formData.down_payment)} />
            <Row label="Amount Financed" value={money(formData.financed_amount)} />
            <Row label="Markup" value={`${formData.markup_percentage}% = ${money(formData.markup_amount)}`} />
            <Row label="APR" value={`${formData.apr}%`} />
            <Row label="Term" value={`${formData.term_months} months`} />
            <Row label="Payment Frequency" value={formData.payment_frequency} />
            <Row label="Payment Amount" value={money(formData.monthly_payment)} />
            <Row label="Total Payable" value={money(formData.total_payable)} />
            <Row label="First Payment" value={formData.payment_start_date} />
          </Section>
        )}

        <Section title="Late Payments & Charity">
          <Row label="Late fee (daily, after 30 days)" value={money(formData.late_fee_amount)} />
          <Row label="Charity recipient" value={formData.charity_name} />
        </Section>

        <Alert variant="info" className="mb-6">
          Payment schedule, all legal clauses, and signature blocks will appear in the full contract PDF.
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={() => goToStep(4)} className="sm:mr-auto">← Edit Terms</Button>
          <Button variant="secondary" loading={saveLoading} onClick={handleSave}>Save as Draft</Button>
          <Button loading={loading} onClick={handleSendForSignature}>Send for Signature →</Button>
        </div>
      </div>
    </div>
  );
}
