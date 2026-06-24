import { useUser } from '../../hooks/useUser';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

function PartySection({ title, prefix, formData, updateForm }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name" value={formData[`${prefix}_name`]} onChange={(e) => updateForm({ [`${prefix}_name`]: e.target.value })} placeholder="Full legal name" required className="col-span-2 sm:col-span-1" />
        <Input label="Email" type="email" value={formData[`${prefix}_email`]} onChange={(e) => updateForm({ [`${prefix}_email`]: e.target.value })} placeholder="email@example.com" required className="col-span-2 sm:col-span-1" />
        <Input label="Phone" type="tel" value={formData[`${prefix}_phone`]} onChange={(e) => updateForm({ [`${prefix}_phone`]: e.target.value })} placeholder="+1 (555) 000-0000" className="col-span-2 sm:col-span-1" />
        <Input label="Address" value={formData[`${prefix}_address`]} onChange={(e) => updateForm({ [`${prefix}_address`]: e.target.value })} placeholder="123 Main St, City, CA 94000" className="col-span-2" />
      </div>
    </div>
  );
}

export default function StepParties({ formData, updateForm, goToStep }) {
  const { dbUser } = useUser();
  const isIjarah = formData.contract_type === 'IJARAH';

  const prefillAsSeller = () => {
    if (dbUser) {
      updateForm({ seller_name: dbUser.full_name, seller_email: dbUser.email, seller_phone: dbUser.phone || '' });
    }
  };

  const canProceed = formData.seller_name && formData.seller_email && formData.buyer_name && formData.buyer_email;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold font-heading text-gray-900">Parties</h2>
        <button onClick={prefillAsSeller} className="text-xs text-teal-600 hover:underline font-medium">
          Auto-fill me as {isIjarah ? 'lessor' : 'seller'}
        </button>
      </div>

      <div className="space-y-8">
        <PartySection title={isIjarah ? 'Lessor (Owner)' : 'Seller'} prefix="seller" formData={formData} updateForm={updateForm} />
        <div className="border-t border-gray-100" />
        <PartySection title={isIjarah ? 'Lessee (Renter)' : 'Buyer'} prefix="buyer" formData={formData} updateForm={updateForm} />
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={() => goToStep(2)}>← Back</Button>
        <Button onClick={() => goToStep(4)} disabled={!canProceed}>Next: {isIjarah ? 'Lease' : 'Deal'} Terms →</Button>
      </div>
    </Card>
  );
}
