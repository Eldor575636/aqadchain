import { useState } from 'react';
import { vehiclesAPI } from '../../utils/api';
import Button from '../../components/Button';
import Input, { Select } from '../../components/Input';
import Alert from '../../components/Alert';
import Card from '../../components/Card';

export default function StepVehicle({ formData, updateForm, goToStep }) {
  const [vinLoading, setVinLoading] = useState(false);
  const [recalls, setRecalls] = useState([]);
  const [vinError, setVinError] = useState('');
  const [marketValue, setMarketValue] = useState(null);

  const lookupVin = async () => {
    const vin = formData.vehicle_vin?.trim();
    if (!vin || vin.length !== 17) {
      setVinError('Please enter a valid 17-character VIN');
      return;
    }
    setVinError('');
    setVinLoading(true);
    setMarketValue(null);
    try {
      const { data } = await vehiclesAPI.lookup(vin);
      updateForm({
        vehicle_year: data.year || '',
        vehicle_make: data.make || '',
        vehicle_model: data.model || '',
        vehicle_trim: data.trim || '',
      });
      setRecalls(data.recalls || []);
      if (data.market_value) setMarketValue(data.market_value);
    } catch (err) {
      setVinError(err.message || 'VIN lookup failed. Enter details manually.');
    } finally {
      setVinLoading(false);
    }
  };

  const canProceed = formData.vehicle_year && formData.vehicle_make && formData.vehicle_model;

  return (
    <Card>
      <h2 className="text-lg font-bold font-heading text-gray-900 mb-6">Vehicle Information</h2>

      {/* VIN Lookup */}
      <div className="mb-6 p-4 bg-gray-50 rounded-card border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Look up by VIN (recommended)</p>
        <div className="flex gap-2">
          <Input
            placeholder="17-character VIN"
            value={formData.vehicle_vin}
            onChange={(e) => updateForm({ vehicle_vin: e.target.value.toUpperCase() })}
            className="flex-1"
            maxLength={17}
            error={vinError}
          />
          <Button onClick={lookupVin} loading={vinLoading} variant="secondary">Look up</Button>
        </div>
      </div>

      {recalls.length > 0 && (
        <Alert variant="warning" title={`⚠ ${recalls.length} active recall(s) found`} className="mb-6">
          {recalls.slice(0, 2).map((r, i) => <div key={i} className="mt-1 text-xs">{r.component}: {r.summary?.slice(0, 100)}…</div>)}
          {recalls.length > 2 && <div className="text-xs mt-1">+ {recalls.length - 2} more recalls</div>}
        </Alert>
      )}

      {marketValue && (
        <Alert variant="info" title="Estimated market value" className="mb-6">
          <span className="text-sm font-semibold">
            {typeof marketValue === 'object'
              ? `${marketValue.low ? `$${Number(marketValue.low).toLocaleString()} – ` : ''}$${Number(marketValue.high || marketValue.average || marketValue).toLocaleString()}`
              : `$${Number(marketValue).toLocaleString()}`}
          </span>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input label="Year" type="number" value={formData.vehicle_year} onChange={(e) => updateForm({ vehicle_year: e.target.value })} placeholder="2020" required />
        <Input label="Make" value={formData.vehicle_make} onChange={(e) => updateForm({ vehicle_make: e.target.value })} placeholder="Toyota" required />
        <Input label="Model" value={formData.vehicle_model} onChange={(e) => updateForm({ vehicle_model: e.target.value })} placeholder="Camry" required />
        <Input label="Trim / Series" value={formData.vehicle_trim} onChange={(e) => updateForm({ vehicle_trim: e.target.value })} placeholder="XLE" />
        <Input label="Mileage" type="number" value={formData.vehicle_mileage} onChange={(e) => updateForm({ vehicle_mileage: e.target.value })} placeholder="45000" />
        <Input label="Color" value={formData.vehicle_color} onChange={(e) => updateForm({ vehicle_color: e.target.value })} placeholder="White" />
      </div>

      <Select label="Title Status" value={formData.title_status} onChange={(e) => updateForm({ title_status: e.target.value })} required className="mb-6">
        <option value="">Select title status</option>
        <option value="CLEAN">Clean</option>
        <option value="SALVAGE">Salvage</option>
        <option value="REBUILT">Rebuilt</option>
      </Select>

      <div className="flex justify-between mt-2">
        <Button variant="ghost" onClick={() => goToStep(1)}>← Back</Button>
        <Button onClick={() => goToStep(3)} disabled={!canProceed}>Next: Parties →</Button>
      </div>
    </Card>
  );
}
