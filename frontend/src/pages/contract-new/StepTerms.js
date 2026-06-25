import { useEffect, useState, useCallback } from 'react';
import { calculatorAPI } from '../../utils/api';
import Button from '../../components/Button';
import Input, { Select } from '../../components/Input';
import Card from '../../components/Card';
import Alert from '../../components/Alert';

const CHARITIES = ['Islamic Relief USA', 'Zakat Foundation of America', 'Helping Hand for Relief', 'ICNA Relief', 'Local mosque / masjid', 'Custom…'];

function money(v) {
  if (!v && v !== 0) return '—';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function StepTerms({ formData, updateForm, goToStep }) {
  const [calcResult, setCalcResult] = useState(null);
  const [calcError, setCalcError] = useState('');
  const [customCharity, setCustomCharity] = useState(false);

  const isIjarah = formData.contract_type === 'IJARAH';

  const runCalc = useCallback(async () => {
    const { car_price, term_months, payment_frequency, payment_start_date } = formData;
    if (!car_price || !term_months) return;

    if (isIjarah) {
      try {
        const { data } = await calculatorAPI.calculate({
          contract_type: 'IJARAH',
          car_price: Number(car_price),
          security_deposit: Number(formData.security_deposit) || 0,
          residual_value: Number(formData.residual_value) || 0,
          term_months: Number(term_months),
          payment_frequency: payment_frequency || 'MONTHLY',
          payment_start_date: payment_start_date || null,
        });
        setCalcResult(data);
        setCalcError('');
        updateForm({
          monthly_payment: data.monthly_payment,
          total_payable: data.total_payable,
          financed_amount: data.rentable_base,
        });
      } catch (err) {
        setCalcError(err.message);
        setCalcResult(null);
      }
      return;
    }

    const { down_payment, markup_percentage, apr } = formData;
    if (!down_payment || !markup_percentage || !apr) return;
    try {
      const { data } = await calculatorAPI.calculate({
        car_price: Number(car_price), down_payment: Number(down_payment),
        markup_percentage: Number(markup_percentage), apr: Number(apr),
        term_months: Number(term_months), payment_frequency: payment_frequency || 'MONTHLY',
        payment_start_date: payment_start_date || null,
      });
      setCalcResult(data);
      setCalcError('');
      updateForm({
        financed_amount: data.financed_amount, markup_amount: data.markup_amount,
        monthly_payment: data.monthly_payment, total_payable: data.total_payable,
      });
    } catch (err) {
      setCalcError(err.message);
      setCalcResult(null);
    }
  }, [
    formData.car_price, formData.down_payment, formData.markup_percentage,
    formData.apr, formData.term_months, formData.payment_frequency,
    formData.payment_start_date, formData.security_deposit, formData.residual_value,
    isIjarah,
  ]);

  useEffect(() => {
    const t = setTimeout(runCalc, 400);
    return () => clearTimeout(t);
  }, [runCalc]);

  const canProceed = isIjarah
    ? formData.car_price && formData.term_months && formData.charity_name
    : formData.car_price && formData.down_payment != null && formData.markup_percentage && formData.apr && formData.term_months && formData.charity_name;

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <div className="md:col-span-3">
        <Card>
          <h2 className="text-lg font-bold font-heading text-gray-900 mb-6">
            {isIjarah ? 'Lease Terms' : 'Deal Terms'}
          </h2>

          <div className="space-y-4">
            {isIjarah ? (
              /* ── Ijarah fields ── */
              <>
                {/* Sub-type */}
                <div>
                  <label className="label">Ijarah Type <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    {[
                      { key: 'OPERATING', label: 'Operating Lease', sub: 'Vehicle returned at end' },
                      { key: 'IMIT', label: 'IMIT (Lease-to-Own)', sub: 'Purchase option at end' },
                    ].map((opt) => (
                      <button key={opt.key} type="button"
                        onClick={() => updateForm({ ijarah_subtype: opt.key, residual_value: opt.key === 'OPERATING' ? 0 : formData.residual_value })}
                        className={`flex-1 py-3 px-4 text-left text-sm rounded-btn border-2 transition-colors ${formData.ijarah_subtype === opt.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="font-semibold text-gray-900">{opt.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Input label="Asset Fair Market Value ($)" type="number" value={formData.car_price}
                  onChange={(e) => updateForm({ car_price: e.target.value })} placeholder="30000" required />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Security Deposit ($)" type="number" value={formData.security_deposit}
                    onChange={(e) => updateForm({ security_deposit: e.target.value })} placeholder="3000"
                    helpText="Refundable at end of lease" />
                  <Input label={`Residual / Buyout Value ($)${formData.ijarah_subtype !== 'IMIT' ? ' (IMIT only)' : ''}`}
                    type="number" value={formData.residual_value}
                    onChange={(e) => updateForm({ residual_value: e.target.value })} placeholder="8000"
                    disabled={formData.ijarah_subtype !== 'IMIT'}
                    helpText={formData.ijarah_subtype === 'IMIT' ? 'Purchase price at lease end' : 'N/A for operating lease'} />
                </div>
              </>
            ) : (
              /* ── Murabaha / Musawama fields ── */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Car Price ($)" type="number" value={formData.car_price}
                    onChange={(e) => updateForm({ car_price: e.target.value })} placeholder="25000" required />
                  <Input label="Down Payment ($)" type="number" value={formData.down_payment}
                    onChange={(e) => updateForm({ down_payment: e.target.value })} placeholder="5000"
                    helpText={formData.car_price ? `Max 25%: ${money(formData.car_price * 0.25)}` : ''} required />
                </div>

                <div>
                  <label className="label">Markup Percentage: <span className="font-bold text-teal-600">{formData.markup_percentage}%</span></label>
                  <input type="range" min="0" max="25" step="0.5" value={formData.markup_percentage}
                    onChange={(e) => updateForm({ markup_percentage: e.target.value })}
                    className="w-full accent-teal-500" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>Max 25%</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="APR (%)" type="number" min="0" max="30" step="0.1" value={formData.apr}
                    onChange={(e) => updateForm({ apr: e.target.value })} placeholder="0" required
                    helpText="Enter 0 for zero-interest" />
                  <Select label="Term (months)" value={formData.term_months} onChange={(e) => updateForm({ term_months: e.target.value })} required>
                    {[6, 12, 18, 24, 36, 48, 60].map((m) => <option key={m} value={m}>{m} months</option>)}
                  </Select>
                </div>
              </>
            )}

            {/* Shared fields */}
            {isIjarah && (
              <Select label="Lease Term (months)" value={formData.term_months} onChange={(e) => updateForm({ term_months: e.target.value })} required>
                {[6, 12, 18, 24, 36, 48, 60].map((m) => <option key={m} value={m}>{m} months</option>)}
              </Select>
            )}

            <div>
              <label className="label">{isIjarah ? 'Rental' : 'Payment'} Frequency</label>
              <div className="flex gap-3">
                {['MONTHLY', 'WEEKLY'].map((f) => (
                  <button key={f} type="button" onClick={() => updateForm({ payment_frequency: f })}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-btn border-2 transition-colors ${formData.payment_frequency === f ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="First Payment Date" type="date" value={formData.payment_start_date}
                onChange={(e) => updateForm({ payment_start_date: e.target.value })} />
              <Input label="Late Fee (daily, $)" type="number" value={formData.late_fee_amount}
                onChange={(e) => updateForm({ late_fee_amount: e.target.value })} placeholder="25"
                helpText="Donated to charity — not seller income" />
            </div>

            <div>
              <label className="label">Charity for Late Fees <span className="text-red-500">*</span></label>
              {!customCharity ? (
                <Select value={formData.charity_name} onChange={(e) => {
                  if (e.target.value === 'Custom…') { setCustomCharity(true); updateForm({ charity_name: '' }); }
                  else updateForm({ charity_name: e.target.value });
                }}>
                  <option value="">Select a charity…</option>
                  {CHARITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input value={formData.charity_name} onChange={(e) => updateForm({ charity_name: e.target.value })} placeholder="Enter charity name" className="flex-1" />
                  <button type="button" onClick={() => { setCustomCharity(false); updateForm({ charity_name: '' }); }} className="text-xs text-gray-500 hover:text-gray-700">← Pick from list</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => goToStep(3)}>← Back</Button>
            <Button onClick={() => goToStep(5)} disabled={!canProceed}>Next: Review →</Button>
          </div>
        </Card>
      </div>

      {/* Live Calculator */}
      <div className="md:col-span-2">
        <Card header={isIjarah ? 'Live Rental Calculator' : 'Live Payment Calculator'}>
          {calcError && <Alert variant="error" className="mb-4">{calcError}</Alert>}
          {calcResult ? (
            <div className="space-y-3">
              {isIjarah ? [
                { label: 'Asset Value', value: money(calcResult.asset_value) },
                { label: 'Security Deposit', value: money(calcResult.security_deposit) },
                ...(formData.ijarah_subtype === 'IMIT' ? [{ label: 'Residual / Buyout', value: money(calcResult.residual_value) }] : []),
                { label: 'Rentable Base', value: money(calcResult.rentable_base) },
                { label: formData.payment_frequency === 'WEEKLY' ? 'Weekly Rental (Ujrah)' : 'Monthly Rental (Ujrah)', value: money(formData.payment_frequency === 'WEEKLY' ? calcResult.weekly_payment : calcResult.monthly_payment), highlight: true },
                { label: 'Total Rentals', value: money(calcResult.total_rentals) },
                { label: 'Total Amount Payable', value: money(calcResult.total_payable) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`flex justify-between py-2.5 border-b border-gray-50 last:border-0 ${highlight ? 'bg-blue-50 -mx-6 px-6 rounded' : ''}`}>
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={`text-sm font-bold ${highlight ? 'text-blue-700 text-base' : 'text-gray-900'}`}>{value}</span>
                </div>
              )) : [
                { label: 'Amount Financed', value: money(calcResult.financed_amount) },
                { label: 'Markup Amount', value: money(calcResult.markup_amount) },
                { label: formData.payment_frequency === 'WEEKLY' ? 'Weekly Payment' : 'Monthly Payment', value: money(formData.payment_frequency === 'WEEKLY' ? calcResult.weekly_payment : calcResult.monthly_payment), highlight: true },
                { label: 'Total Payable', value: money(calcResult.total_payable) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`flex justify-between py-2.5 border-b border-gray-50 last:border-0 ${highlight ? 'bg-teal-50 -mx-6 px-6 rounded' : ''}`}>
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={`text-sm font-bold ${highlight ? 'text-teal-700 text-base' : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-3">*Estimates based on entered values. Final amounts in signed contract.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Enter {isIjarah ? 'lease' : 'deal'} terms to see live estimates</p>
          )}
        </Card>

        {isIjarah && (
          <div className="mt-4 p-4 rounded-lg border text-sm" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <p className="font-semibold text-blue-800 mb-1">What is IMIT?</p>
            <p className="text-blue-700 text-xs leading-relaxed">Ijarah Muntahia Bittamleek — a lease that ends with a separate sale contract (Bay') giving the lessee the right to buy the vehicle at the agreed residual value. Governed by AAOIFI Shari'ah Standard No. 9.</p>
          </div>
        )}
      </div>
    </div>
  );
}
