import { useState } from 'react';
import { demoAPI } from '../utils/api';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { Textarea } from './Input';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function maxDateISO() {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toISOString().split('T')[0];
}

export default function BookDemoModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', preferred_date: '', preferred_time: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [meetLink, setMeetLink] = useState(null);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const canSubmit = form.name && form.email && form.preferred_date && form.preferred_time;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await demoAPI.create(form);
      setMeetLink(data.request?.meet_link || null);
      setDone(true);
    } catch (err) {
      alert(err.message || 'Failed to book demo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    setMeetLink(null);
    setForm({ name: '', email: '', phone: '', company: '', preferred_date: '', preferred_time: '', message: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={done ? 'Demo Booked!' : '📅 Book a Live Demo'} size="md">
      {done ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-gray-700 font-medium mb-1">You're all set, {form.name}!</p>
          <p className="text-gray-500 text-sm mb-6">
            We'll see you on {new Date(form.preferred_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {form.preferred_time}.
            A confirmation has been sent to {form.email}.
          </p>
          {meetLink && (
            <a href={meetLink} target="_blank" rel="noreferrer" className="btn-primary w-full mb-3 inline-flex items-center justify-center gap-2">
              🎥 Join Google Meet
            </a>
          )}
          <Button onClick={handleClose} variant={meetLink ? 'secondary' : 'primary'} className="w-full">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">Pick a date and time, and we'll walk you through AqadChain live.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={form.name} onChange={(e) => update({ name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
            <Input label="Company" value={form.company} onChange={(e) => update({ company: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preferred Date" type="date" required
              min={todayISO()} max={maxDateISO()}
              value={form.preferred_date}
              onChange={(e) => update({ preferred_date: e.target.value })}
            />
            <div>
              <label className="label">Preferred Time<span className="text-red-500 ml-0.5">*</span></label>
              <select className="input" value={form.preferred_time} onChange={(e) => update({ preferred_time: e.target.value })} required>
                <option value="">Select a time</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <Textarea label="Anything you'd like us to cover?" value={form.message} onChange={(e) => update({ message: e.target.value })} rows={2} />
          <Button type="submit" disabled={!canSubmit} loading={submitting} className="w-full">Confirm Demo Session</Button>
        </form>
      )}
    </Modal>
  );
}
