import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, vehiclesAPI } from '../utils/api';
import { AuthNavbar } from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Input, { Select, Textarea } from '../components/Input';
import { toast } from 'react-toastify';

const initialState = {
  vehicle_vin: '', vehicle_year: '', vehicle_make: '', vehicle_model: '', vehicle_trim: '',
  vehicle_mileage: '', vehicle_color: '', title_status: '',
  asking_price: '', contract_type_offered: 'MURABAHA', description: '', city: '', state: '',
};

export default function SellListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');
  const [recalls, setRecalls] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const lookupVin = async () => {
    const vin = form.vehicle_vin?.trim();
    if (!vin || vin.length !== 17) { setVinError('Please enter a valid 17-character VIN'); return; }
    setVinError(''); setVinLoading(true);
    try {
      const { data } = await vehiclesAPI.lookup(vin);
      update({
        vehicle_year: data.year || '', vehicle_make: data.make || '',
        vehicle_model: data.model || '', vehicle_trim: data.trim || '',
      });
      setRecalls(data.recalls || []);
    } catch (err) {
      setVinError(err.message || 'VIN lookup failed. Enter details manually.');
    } finally {
      setVinLoading(false);
    }
  };

  const canSubmit = form.vehicle_year && form.vehicle_make && form.vehicle_model && form.asking_price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await listingsAPI.create({
        ...form,
        vehicle_vin: form.vehicle_vin || null,
        vehicle_year: Number(form.vehicle_year),
        vehicle_mileage: form.vehicle_mileage ? Number(form.vehicle_mileage) : null,
        asking_price: Number(form.asking_price),
        title_status: form.title_status || null,
      });
      toast.success('Listing published!');
      navigate(`/marketplace/${data.listing.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-1">List Your Vehicle</h1>
        <p className="text-gray-500 text-sm mb-6">Reach halal-financing buyers. Your listing goes live immediately.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card header="Vehicle Information">
            <div className="mb-6 p-4 bg-gray-50 rounded-card border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Look up by VIN (recommended)</p>
              <div className="flex gap-2">
                <Input placeholder="17-character VIN" value={form.vehicle_vin}
                  onChange={(e) => update({ vehicle_vin: e.target.value.toUpperCase() })}
                  className="flex-1" maxLength={17} error={vinError} />
                <Button type="button" onClick={lookupVin} loading={vinLoading} variant="secondary">Look up</Button>
              </div>
            </div>

            {recalls.length > 0 && (
              <Alert variant="warning" title={`⚠ ${recalls.length} active recall(s) found`} className="mb-6">
                Disclose these to potential buyers.
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Year" type="number" value={form.vehicle_year} onChange={(e) => update({ vehicle_year: e.target.value })} required />
              <Input label="Make" value={form.vehicle_make} onChange={(e) => update({ vehicle_make: e.target.value })} required />
              <Input label="Model" value={form.vehicle_model} onChange={(e) => update({ vehicle_model: e.target.value })} required />
              <Input label="Trim" value={form.vehicle_trim} onChange={(e) => update({ vehicle_trim: e.target.value })} />
              <Input label="Mileage" type="number" value={form.vehicle_mileage} onChange={(e) => update({ vehicle_mileage: e.target.value })} />
              <Input label="Color" value={form.vehicle_color} onChange={(e) => update({ vehicle_color: e.target.value })} />
            </div>
            <Select label="Title Status" value={form.title_status} onChange={(e) => update({ title_status: e.target.value })}>
              <option value="">Select title status</option>
              <option value="CLEAN">Clean</option>
              <option value="SALVAGE">Salvage</option>
              <option value="REBUILT">Rebuilt</option>
            </Select>
          </Card>

          <Card header="Listing Details">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Asking Price" type="number" value={form.asking_price} onChange={(e) => update({ asking_price: e.target.value })} required />
              <Select label="Contract Type Offered" value={form.contract_type_offered} onChange={(e) => update({ contract_type_offered: e.target.value })} required>
                <option value="MURABAHA">Murabaha (Cost-Plus)</option>
                <option value="MUSAWAMA">Musawama (Negotiated)</option>
                <option value="IJARAH">Ijarah (Lease)</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="City" value={form.city} onChange={(e) => update({ city: e.target.value })} />
              <Input label="State" value={form.state} onChange={(e) => update({ state: e.target.value })} />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => update({ description: e.target.value })}
              placeholder="Condition, history, why you're selling, anything buyers should know…" />
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate('/marketplace')}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit} loading={submitting}>Publish Listing</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
