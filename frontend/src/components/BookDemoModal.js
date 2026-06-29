import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { demoAPI } from '../utils/api';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { Textarea } from './Input';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const LOCALE_MAP = { en: 'en-US', uz: 'uz-UZ', ru: 'ru-RU' };

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function maxDateISO() {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toISOString().split('T')[0];
}

export default function BookDemoModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
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
    <Modal isOpen={isOpen} onClose={handleClose} title={done ? t('demo.titleDone') : t('demo.title')} size="md">
      {done ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-gray-700 font-medium mb-1">{t('demo.successTitle', { name: form.name })}</p>
          <p className="text-gray-500 text-sm mb-6">
            {t('demo.successBody', {
              date: new Date(form.preferred_date).toLocaleDateString(LOCALE_MAP[i18n.language] || 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
              time: form.preferred_time,
              email: form.email,
            })}
          </p>
          {meetLink && (
            <a href={meetLink} target="_blank" rel="noreferrer" className="btn-primary w-full mb-3 inline-flex items-center justify-center gap-2">
              {t('demo.joinMeet')}
            </a>
          )}
          <Button onClick={handleClose} variant={meetLink ? 'secondary' : 'primary'} className="w-full">{t('demo.done')}</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">{t('demo.intro')}</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('demo.name')} value={form.name} onChange={(e) => update({ name: e.target.value })} required />
            <Input label={t('demo.email')} type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('demo.phone')} value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
            <Input label={t('demo.company')} value={form.company} onChange={(e) => update({ company: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('demo.preferredDate')} type="date" required
              min={todayISO()} max={maxDateISO()}
              value={form.preferred_date}
              onChange={(e) => update({ preferred_date: e.target.value })}
            />
            <div>
              <label className="label">{t('demo.preferredTime')}<span className="text-red-500 ml-0.5">*</span></label>
              <select className="input" value={form.preferred_time} onChange={(e) => update({ preferred_time: e.target.value })} required>
                <option value="">{t('demo.selectTime')}</option>
                {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>
          <Textarea label={t('demo.message')} value={form.message} onChange={(e) => update({ message: e.target.value })} rows={2} />
          <Button type="submit" disabled={!canSubmit} loading={submitting} className="w-full">{t('demo.confirm')}</Button>
        </form>
      )}
    </Modal>
  );
}
