import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { authAPI } from '../utils/api';
import { useUser } from '../hooks/useUser';
import { AuthNavbar } from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

export default function Settings() {
  const { logout } = useAuth0();
  const { dbUser, refreshUser } = useUser();
  const [name, setName] = useState(dbUser?.full_name || '');
  const [phone, setPhone] = useState(dbUser?.phone || '');
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ full_name: name, phone });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-8">Account Settings</h1>

        {/* Profile */}
        <Card header="Profile" className="mb-6">
          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={dbUser?.email} disabled helpText="Email cannot be changed here. Update via your Auth0 account." />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="mt-6">
            <Button loading={saving} onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </Card>

        {/* Subscription */}
        <Card header="Subscription" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Individual Plan</p>
              <p className="text-sm text-gray-500">$9.99/month · Renews monthly</p>
            </div>
            <Button variant="secondary" size="sm" disabled>Manage Plan</Button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Subscription management via Stripe is coming in Phase 2.</p>
        </Card>

        {/* Security */}
        <Card header="Security" className="mb-6">
          <p className="text-sm text-gray-600 mb-4">Password and two-factor authentication are managed via Auth0.</p>
          <Button variant="secondary" size="sm" onClick={() => window.open(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/u/reset-password`, '_blank')}>
            Change Password
          </Button>
        </Card>

        {/* Danger zone */}
        <Card header={<span className="text-red-600 font-semibold">Danger Zone</span>}>
          <p className="text-sm text-gray-600 mb-4">Deleting your account will permanently remove all your data. This cannot be undone.</p>
          <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>Delete Account</Button>
        </Card>
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setDeleteModal(false); toast.info('Please contact support@aqadchain.com to delete your account.'); }}>Request Deletion</Button>
          </div>
        }>
        <p className="text-gray-600 text-sm">To delete your account and all associated data, please email <strong>support@aqadchain.com</strong> from your registered email address. We'll process the request within 5 business days.</p>
      </Modal>
    </div>
  );
}
