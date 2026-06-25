import { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';

/* ─── Reusable animation helpers ─────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated gradient orbs ─────────────────────────────────────── */
function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,110,99,0.35) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-[0%] left-[30%] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,110,99,0.2) 0%, transparent 70%)' }}
      />
    </div>
  );
}

/* ─── Grid background ────────────────────────────────────────────── */
function GridBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

/* ─── Mini deal card ─────────────────────────────────────────────── */
function MiniDealCard({ id, vehicle, type, amount, monthly, term, color }) {
  return (
    <div className="flex-shrink-0 w-64 rounded-xl border border-white/8 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(12px)' }}>
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-white/50 text-[11px] font-mono">{id}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: color + '22', color }}>
          ✓ Signed
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-white text-sm font-semibold truncate">{vehicle}</p>
        <p className="text-xs mb-2" style={{ color }}>{type}</p>
        <div className="flex justify-between text-xs">
          <div>
            <p className="text-white/30">Financed</p>
            <p className="text-white font-semibold">{amount}</p>
          </div>
          <div>
            <p className="text-white/30">Monthly</p>
            <p className="text-white font-semibold">{monthly}</p>
          </div>
          <div>
            <p className="text-white/30">Term</p>
            <p className="text-white font-semibold">{term}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const exampleDeals = [
  { id: 'AQD-000142', vehicle: '2022 Toyota Camry XLE', type: 'Murabaha', amount: '$18,500', monthly: '$412', term: '48 mo', color: '#4ade80' },
  { id: 'AQD-000158', vehicle: '2023 Honda CR-V EX-L', type: 'Musawama', amount: '$27,900', monthly: '$598', term: '52 mo', color: '#4ade80' },
  { id: 'AQD-000171', vehicle: '2021 Ford F-150 XLT', type: 'Ijarah Lease', amount: '$34,200', monthly: '$715', term: '36 mo', color: '#60a5fa' },
  { id: 'AQD-000186', vehicle: '2023 Tesla Model Y', type: 'Murabaha', amount: '$42,800', monthly: '$890', term: '54 mo', color: '#4ade80' },
  { id: 'AQD-000203', vehicle: '2020 BMW X5 xDrive40i', type: 'Musawama', amount: '$38,650', monthly: '$805', term: '48 mo', color: '#4ade80' },
  { id: 'AQD-000219', vehicle: '2022 Chevrolet Tahoe', type: 'Ijarah Lease', amount: '$45,100', monthly: '$940', term: '42 mo', color: '#60a5fa' },
  { id: 'AQD-000234', vehicle: '2023 Lexus RX 350', type: 'Murabaha', amount: '$31,400', monthly: '$652', term: '48 mo', color: '#4ade80' },
  { id: 'AQD-000251', vehicle: '2021 Jeep Wrangler Rubicon', type: 'Musawama', amount: '$29,750', monthly: '$615', term: '46 mo', color: '#4ade80' },
];

function DealTicker() {
  const doubled = [...exampleDeals, ...exampleDeals];
  return (
    <div className="overflow-hidden py-10">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="flex gap-4 w-max"
      >
        {doubled.map((deal, i) => (
          <MiniDealCard key={i} {...deal} />
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Rotating slogan ────────────────────────────────────────────── */
const slogans = [
  { line: 'Halal contracts. No compromise.', sub: 'Shariah-compliant from start to finish.' },
  { line: 'No Riba. No hidden fees.', sub: 'Fixed markup agreed upfront — nothing changes.' },
  { line: 'Signed in minutes. Legally binding.', sub: 'DocuSign e-signatures built right in.' },
  { line: 'Murabaha. Musawama. Ijarah.', sub: 'Every Islamic finance structure covered.' },
  { line: 'Late fees go to charity — not the seller.', sub: 'Accountability without interest.' },
  { line: 'California law. AAOIFI standards.', sub: 'Enforceable and Shariah-certified.' },
];

function RotatingSlogan() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % slogans.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-20 flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl font-bold text-white">{slogans[i].line}</p>
          <p className="text-white/40 text-sm mt-1">{slogans[i].sub}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Animated stat counter ──────────────────────────────────────── */
function StatCounter({ end, prefix = '', suffix = '', label, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 60;
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(t); }
      else setVal(start);
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-extrabold font-heading text-white">
        {prefix}{display}{suffix}
      </p>
      <p className="text-white/40 text-sm mt-1">{label}</p>
    </div>
  );
}

/* ─── Press & charity ticker data ────────────────────────────────── */
const pressItems = [
  { name: 'San Francisco Chronicle', style: 'font-serif font-bold text-lg' },
  { name: 'TechCrunch', style: 'font-extrabold text-lg tracking-tight' },
  { name: 'SF Gate', style: 'font-bold text-lg uppercase tracking-wider' },
  { name: 'Forbes', style: 'font-serif font-bold text-xl italic' },
  { name: 'Wired', style: 'font-extrabold text-xl uppercase tracking-widest' },
  { name: 'Business Insider', style: 'font-bold text-base uppercase tracking-wide' },
  { name: 'The Information', style: 'font-serif text-lg font-semibold' },
  { name: 'KTVU Fox 2', style: 'font-extrabold text-base uppercase tracking-widest' },
];

const charityItems = [
  { name: 'Muslim Community Association', icon: '🕌' },
  { name: 'Islamic Society of SF', icon: '🕌' },
  { name: 'Islamic Relief USA', icon: '🌙' },
  { name: 'Zakat Foundation', icon: '🌙' },
  { name: 'UCSF Benioff Children\'s', icon: '🏥' },
  { name: 'Lucile Packard Children\'s', icon: '🏥' },
  { name: 'Shriners Hospital', icon: '🏥' },
  { name: 'American Red Cross', icon: '🔴' },
  { name: 'SF-Marin Food Bank', icon: '🍞' },
  { name: 'Second Harvest', icon: '🍞' },
  { name: 'Pediatric Cancer Research', icon: '💛' },
  { name: 'CHLA', icon: '🏥' },
];

/* ─── Scrolling trust ticker ─────────────────────────────────────── */
const trustItems = [
  '✦ Shariah-Compliant',
  '✦ Legally Binding',
  '✦ DocuSign E-Signatures',
  '✦ California Law',
  '✦ Murabaha, Musawama & Ijarah',
  '✦ No Riba',
  '✦ AAOIFI Standards',
  '✦ Encrypted & Secure',
];

function TrustTicker() {
  const doubled = [...trustItems, ...trustItems];
  return (
    <div className="overflow-hidden py-4 border-y border-white/5"
      style={{ background: 'rgba(13,110,99,0.08)' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex gap-10 whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-medium text-white/40 flex-shrink-0">{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Live Calculator ────────────────────────────────────────────── */
function LiveCalculator() {
  const [tab, setTab] = useState('murabaha');
  const [view, setView] = useState('buyer');
  const [vehicleUse, setVehicleUse] = useState('personal');

  // Murabaha/Musawama state
  const [price, setPrice] = useState('25000');
  const [down, setDown] = useState('5000');
  const [markup, setMarkup] = useState('8');
  const [months, setMonths] = useState('24');

  // Ijarah state
  const [assetVal, setAssetVal] = useState('25000');
  const [deposit, setDeposit] = useState('3000');
  const [residual, setResidual] = useState('5000');
  const [ijarMonths, setIjarMonths] = useState('24');
  const [ijarSubtype, setIjarSubtype] = useState('IMIT');

  const fmt = (n) => isNaN(n) || n == null ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Murabaha calc
  const p = parseFloat(price) || 0;
  const d = parseFloat(down) || 0;
  const m = parseFloat(markup) || 0;
  const mo = parseInt(months) || 1;
  const financed = p - d;
  const markupAmt = financed * (m / 100);
  const total = financed + markupAmt;
  const monthly = total / mo;
  const totalPayable = d + total;
  const sellerZakat = markupAmt * 0.025;

  // Ijarah calc
  const av = parseFloat(assetVal) || 0;
  const dep = parseFloat(deposit) || 0;
  const res = ijarSubtype === 'IMIT' ? (parseFloat(residual) || 0) : 0;
  const iMo = parseInt(ijarMonths) || 1;
  const rentBase = av - dep - res;
  const monthlyRental = rentBase > 0 ? rentBase / iMo : 0;
  const totalRentals = monthlyRental * iMo;
  const ijarTotal = dep + totalRentals + res;
  const lessorZakat = totalRentals * 0.025;

  const tabs = [
    { key: 'murabaha', label: 'Murabaha', color: '#0D6E63' },
    { key: 'musawama', label: 'Musawama', color: '#0D6E63' },
    { key: 'ijarah', label: 'Ijarah', color: '#1D4ED8' },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-12">
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-3">Free Calculator</p>
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-white">See your numbers first</h2>
          <p className="text-white/40 mt-3 max-w-xl mx-auto">Calculate payments, total cost, and Zakat estimate — before creating a contract.</p>
        </FadeUp>

        <FadeIn>
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>

            {/* Tab bar */}
            <div className="flex border-b border-white/8">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex-1 py-4 text-sm font-semibold transition-all"
                  style={{
                    color: tab === t.key ? t.color : 'rgba(255,255,255,0.3)',
                    borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
                    background: tab === t.key ? `${t.color}10` : 'transparent',
                  }}>
                  {t.label}
                  {t.key === 'ijarah' && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(29,78,216,0.3)', color: '#60a5fa' }}>New</span>}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Inputs */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold">Deal Details</h3>
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {['buyer', 'seller'].map((v) => (
                      <button key={v} onClick={() => setView(v)}
                        className="px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize"
                        style={{ background: view === v ? 'rgba(13,110,99,0.4)' : 'transparent', color: view === v ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {tab !== 'ijarah' ? (
                  <div className="space-y-4">
                    <CalcInput label={tab === 'murabaha' ? 'Vehicle Cost ($)' : 'Agreed Price ($)'} value={price} onChange={setPrice} placeholder="25000" />
                    <CalcInput label="Down Payment ($)" value={down} onChange={setDown} placeholder="5000" />
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-white/50 text-sm">Markup: <span className="text-teal-400 font-bold">{markup}%</span></label>
                        {tab === 'musawama' && <span className="text-white/30 text-xs">Cost not disclosed</span>}
                      </div>
                      <input type="range" min="0" max="25" step="0.5" value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-full accent-teal-500" />
                      <div className="flex justify-between text-xs text-white/20 mt-1"><span>0%</span><span>25% max</span></div>
                    </div>
                    <div>
                      <label className="text-white/50 text-sm block mb-2">Term</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[12, 24, 36, 48].map((m) => (
                          <button key={m} onClick={() => setMonths(String(m))}
                            className="py-2 text-sm font-semibold rounded-lg border transition-all"
                            style={{ borderColor: months === String(m) ? '#0D6E63' : 'rgba(255,255,255,0.1)', background: months === String(m) ? 'rgba(13,110,99,0.25)' : 'transparent', color: months === String(m) ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                            {m}mo
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-2">
                      {[{ k: 'IMIT', l: 'IMIT (Lease-to-Own)' }, { k: 'OPERATING', l: 'Operating Lease' }].map((s) => (
                        <button key={s.k} onClick={() => setIjarSubtype(s.k)}
                          className="flex-1 py-2 text-xs font-semibold rounded-lg border transition-all"
                          style={{ borderColor: ijarSubtype === s.k ? '#1D4ED8' : 'rgba(255,255,255,0.1)', background: ijarSubtype === s.k ? 'rgba(29,78,216,0.2)' : 'transparent', color: ijarSubtype === s.k ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                          {s.l}
                        </button>
                      ))}
                    </div>
                    <CalcInput label="Asset Value ($)" value={assetVal} onChange={setAssetVal} placeholder="25000" />
                    <CalcInput label="Security Deposit ($)" value={deposit} onChange={setDeposit} placeholder="3000" />
                    {ijarSubtype === 'IMIT' && <CalcInput label="Residual / Buyout ($)" value={residual} onChange={setResidual} placeholder="5000" />}
                    <div>
                      <label className="text-white/50 text-sm block mb-2">Lease Term</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[12, 24, 36, 48].map((m) => (
                          <button key={m} onClick={() => setIjarMonths(String(m))}
                            className="py-2 text-sm font-semibold rounded-lg border transition-all"
                            style={{ borderColor: ijarMonths === String(m) ? '#1D4ED8' : 'rgba(255,255,255,0.1)', background: ijarMonths === String(m) ? 'rgba(29,78,216,0.2)' : 'transparent', color: ijarMonths === String(m) ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                            {m}mo
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="p-6 md:p-8">
                <h3 className="text-white font-bold mb-6">
                  {view === 'buyer' ? '📊 Buyer Breakdown' : '📈 Seller Breakdown'}
                </h3>

                {tab !== 'ijarah' ? (
                  <div className="space-y-3">
                    {view === 'buyer' ? <>
                      <CalcRow label="Vehicle Price" value={fmt(p)} />
                      <CalcRow label="Down Payment" value={fmt(d)} />
                      <CalcRow label="Amount Financed" value={fmt(financed)} />
                      <CalcRow label={`Markup (${markup}%)`} value={fmt(markupAmt)} />
                      <CalcRow label="Monthly Payment" value={fmt(monthly)} highlight />
                      <CalcRow label="Total Cost" value={fmt(totalPayable)} />
                    </> : <>
                      <CalcRow label="Sale Price" value={fmt(p)} />
                      <CalcRow label="Down Payment Received" value={fmt(d)} />
                      <CalcRow label="Profit (Markup)" value={fmt(markupAmt)} highlight />
                      <CalcRow label="Total Received" value={fmt(totalPayable)} />
                    </>}

                    {/* Zakat section */}
                    <div className="mt-6 pt-4 border-t border-white/8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-yellow-400">☽ Zakat Estimate</span>
                        <span className="text-xs text-white/30">(2.5%)</span>
                      </div>
                      {view === 'buyer' ? (
                        <>
                          <div className="flex gap-2 mb-3">
                            {[{ k: 'personal', l: 'Personal Use' }, { k: 'trade', l: 'Trade/Business' }].map((u) => (
                              <button key={u.k} onClick={() => setVehicleUse(u.k)}
                                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                                style={{ borderColor: vehicleUse === u.k ? '#C9A84C' : 'rgba(255,255,255,0.1)', background: vehicleUse === u.k ? 'rgba(201,168,76,0.15)' : 'transparent', color: vehicleUse === u.k ? '#C9A84C' : 'rgba(255,255,255,0.3)' }}>
                                {u.l}
                              </button>
                            ))}
                          </div>
                          {vehicleUse === 'personal'
                            ? <p className="text-white/30 text-xs">✓ Personal-use vehicles are generally <strong className="text-white/50">exempt from Zakat</strong>.</p>
                            : <CalcRow label="Zakat on vehicle (trade)" value={fmt(p * 0.025)} gold />}
                        </>
                      ) : (
                        <CalcRow label="Zakat on profit received" value={fmt(sellerZakat)} gold />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {view === 'buyer' ? <>
                      <CalcRow label="Asset Value" value={fmt(av)} />
                      <CalcRow label="Security Deposit" value={fmt(dep)} />
                      {ijarSubtype === 'IMIT' && <CalcRow label="Buyout Price" value={fmt(res)} />}
                      <CalcRow label="Monthly Rental (Ujrah)" value={fmt(monthlyRental)} highlight blue />
                      <CalcRow label="Total Rentals" value={fmt(totalRentals)} />
                      <CalcRow label="Total Cost" value={fmt(ijarTotal)} />
                    </> : <>
                      <CalcRow label="Asset Value" value={fmt(av)} />
                      <CalcRow label="Deposit Received" value={fmt(dep)} />
                      <CalcRow label="Total Rental Income" value={fmt(totalRentals)} highlight blue />
                      {ijarSubtype === 'IMIT' && <CalcRow label="Buyout at End" value={fmt(res)} />}
                      <CalcRow label="Total Received" value={fmt(ijarTotal)} />
                    </>}

                    <div className="mt-6 pt-4 border-t border-white/8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-yellow-400">☽ Zakat Estimate</span>
                        <span className="text-xs text-white/30">(2.5%)</span>
                      </div>
                      {view === 'buyer'
                        ? <p className="text-white/30 text-xs">✓ Leased vehicles used personally are generally <strong className="text-white/50">exempt from Zakat</strong> for the lessee.</p>
                        : <CalcRow label="Lessor Zakat on rental income" value={fmt(lessorZakat)} gold />}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-white/20 text-xs mb-4">*Estimates only. Zakat calculations may vary — consult a qualified scholar.</p>
                  <a href="/login" className="block w-full py-3 text-center text-sm font-bold rounded-xl transition-all"
                    style={{ background: 'rgba(13,110,99,0.3)', color: '#4ade80', border: '1px solid rgba(13,110,99,0.4)' }}>
                    Create a real contract →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CalcInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-white/50 text-sm block mb-1.5">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
    </div>
  );
}

function CalcRow({ label, value, highlight, blue, gold }) {
  return (
    <div className={`flex justify-between py-2.5 rounded-lg px-3 -mx-3 ${highlight || gold ? '' : ''}`}
      style={highlight ? { background: blue ? 'rgba(29,78,216,0.15)' : 'rgba(13,110,99,0.15)' } : gold ? { background: 'rgba(201,168,76,0.1)' } : {}}>
      <span className="text-sm" style={{ color: gold ? '#C9A84C' : 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: gold ? '#C9A84C' : highlight ? (blue ? '#60a5fa' : '#4ade80') : 'rgba(255,255,255,0.9)' }}>{value}</span>
    </div>
  );
}

/* ─── Step card ──────────────────────────────────────────────────── */
function StepCard({ number, title, description, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative rounded-2xl p-6 border border-white/8 group cursor-default"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(13,110,99,0.15), transparent 70%)' }} />

      <div className="relative">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold text-sm font-heading"
          style={{ background: 'rgba(13,110,99,0.3)', color: '#4ade80', border: '1px solid rgba(13,110,99,0.4)' }}>
          {number}
        </div>
        <h3 className="text-white font-bold font-heading mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Contract type card ─────────────────────────────────────────── */
function ContractCard({ title, subtitle, description, points, isHighlight, delay, badge }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative rounded-2xl p-6 border group cursor-default overflow-hidden"
      style={{
        background: isHighlight ? 'rgba(13,110,99,0.12)' : 'rgba(255,255,255,0.03)',
        borderColor: isHighlight ? 'rgba(13,110,99,0.5)' : 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {isHighlight && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(13,110,99,0.8), transparent)' }} />
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ background: isHighlight ? 'rgba(13,110,99,0.4)' : 'rgba(201,168,76,0.2)', color: isHighlight ? '#4ade80' : '#C9A84C' }}>
          م
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold font-heading">{title}</h3>
            {badge && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,78,216,0.25)', color: '#60a5fa', border: '1px solid rgba(29,78,216,0.4)' }}>{badge}</span>}
          </div>
          <p className="text-xs font-medium mt-0.5" style={{ color: isHighlight ? '#4ade80' : '#C9A84C' }}>{subtitle}</p>
        </div>
      </div>
      <p className="text-white/50 text-sm leading-relaxed mb-4">{description}</p>
      <ul className="space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-white/60">
            <span style={{ color: isHighlight ? '#4ade80' : '#C9A84C' }}>✓</span>
            {p}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─── Pricing card ───────────────────────────────────────────────── */
function PricingCard({ name, price, description, features, highlight, enterprise, onStart, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl p-6 border overflow-hidden"
      style={{
        background: enterprise ? 'rgba(201,168,76,0.07)' : highlight ? 'rgba(13,110,99,0.12)' : 'rgba(255,255,255,0.03)',
        borderColor: enterprise ? 'rgba(201,168,76,0.35)' : highlight ? 'rgba(13,110,99,0.6)' : 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {highlight && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #0D6E63, transparent)' }} />
          <div className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-3">Most Popular</div>
        </>
      )}
      {enterprise && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C9A84C' }}>Enterprise</div>
        </>
      )}
      <h3 className="text-white text-xl font-bold font-heading">{name}</h3>
      <p className="text-white/40 text-sm mt-1 mb-4">{description}</p>
      <div className="mb-6">
        <span className={`font-extrabold text-white font-heading ${price === 'Custom' ? 'text-3xl' : 'text-5xl'}`}>{price}</span>
        {price !== 'Custom' && <span className="text-white/40 text-sm">/month</span>}
        {price === 'Custom' && <p className="text-white/30 text-xs mt-1">Tailored to your volume</p>}
      </div>
      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl font-semibold text-sm mb-6 transition-all"
        style={enterprise
          ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }
          : highlight
          ? { background: 'linear-gradient(135deg, #0D6E63, #0a5248)', color: '#fff', boxShadow: '0 0 20px rgba(13,110,99,0.4)' }
          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }
        }
      >
        {enterprise ? 'Contact sales →' : 'Get started'}
      </motion.button>
      <ul className="space-y-3">
        {features.map((f) => (
          <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.available ? 'text-white/70' : 'text-white/25'}`}>
            <span className={f.available ? 'text-teal-400' : 'text-white/20'}>{f.available ? '✓' : '×'}</span>
            {f.text}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─── FAQ item ───────────────────────────────────────────────────── */
function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="border-b border-white/8"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-white/80 font-medium text-sm pr-8">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-teal-400 text-xl flex-shrink-0"
        >+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-white/40 text-sm leading-relaxed pb-5">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Home page ─────────────────────────────────────────────── */
const faqItems = [
  { question: 'What makes a car financing contract Halal?', answer: 'A Halal contract avoids Riba (interest). The seller and buyer agree on a fixed markup as part of a genuine sale — the profit comes from commerce, not lending. Payments are in installments with no compounding.' },
  { question: 'What is the difference between Murabaha and Musawama?', answer: 'In Murabaha, the seller discloses their purchase cost and the buyer agrees to a fixed markup above it. In Musawama, both parties negotiate a price without requiring cost disclosure. Both are Shariah-compliant.' },
  { question: 'How does the late fee work without interest?', answer: 'Late fees collected are donated to a charity both parties agree on — the seller does not keep them. This creates accountability without the seller profiting from tardiness (which would be Riba).' },
  { question: 'Is this legally enforceable in California?', answer: 'Yes. Contracts are structured as standard deferred-payment sale agreements under California law, executed via DocuSign which is compliant with the federal ESIGN Act.' },
  { question: 'Do I need a lawyer?', answer: 'No. AqadChain generates a complete, professionally structured contract automatically. For large transactions, independent legal review is always wise.' },
];

export default function Home() {
  const { loginWithRedirect } = useAuth0();
  const { scrollYProgress } = useScroll();
  const navbarOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const signUp = () => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#080C0F', color: '#fff' }}>

      {/* Sticky progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 z-50 origin-left"
        style={{ scaleX: scrollYProgress, background: 'linear-gradient(90deg, #0D6E63, #C9A84C)' }} />

      <PublicNavbar dark />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
        <GridBg />
        <Orbs />

        <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border"
            style={{ background: 'rgba(13,110,99,0.15)', borderColor: 'rgba(13,110,99,0.4)', color: '#4ade80' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Shariah-Compliant · Legally Binding · California Law
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold font-heading leading-[1.05] mb-6"
          >
            Halal vehicle{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #0D6E63 0%, #4ade80 40%, #C9A84C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              financing
            </span>
            <br />contracts in minutes
          </motion.h1>

          {/* Rotating slogan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-10"
          >
            <RotatingSlogan />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              onClick={signUp}
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(13,110,99,0.6)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl font-bold text-base text-white"
              style={{ background: 'linear-gradient(135deg, #0D6E63, #0a5248)', boxShadow: '0 0 24px rgba(13,110,99,0.4)' }}
            >
              Get started free →
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/how-it-works"
                className="px-8 py-4 rounded-xl font-semibold text-base text-white/70 border border-white/10 hover:border-white/20 hover:text-white transition-colors block"
                style={{ backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.04)' }}>
                See how it works
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #080C0F, transparent)' }} />
      </section>

      {/* ── MARKETPLACE TEASER ───────────────────────────────────── */}
      <section className="border-b border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <Link to="/marketplace" className="block group">
          <div className="flex flex-col items-center pt-6 pb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
              style={{ background: 'rgba(201,168,76,0.18)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
              🔥 New · Marketplace is live
            </span>
            <p className="text-center text-white/60 text-sm font-semibold group-hover:text-white transition-colors">
              Browse halal-financed vehicles for sale →
            </p>
          </div>
        </Link>
        <DealTicker />
      </section>

      {/* ── TRUST TICKER ────────────────────────────────────────── */}
      <TrustTicker />

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={2400000} prefix="$" suffix="+" label="Contract volume financed" />
          <StatCounter end={430} suffix="+" label="Signed halal contracts" />
          <StatCounter end={98.4} suffix="%" label="Customer satisfaction" decimals={1} />
          <StatCounter end={14} suffix=" states" label="Served across the US" />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(13,110,99,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto relative">
          <FadeUp className="text-center mb-16">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-white">
              Three steps to a<br />signed Halal contract
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { number: '01', title: 'Create your contract', description: 'Enter vehicle details, parties, and deal terms in a guided flow. Our live calculator shows payment amounts in real time.' },
              { number: '02', title: 'Sign electronically', description: 'Both parties receive DocuSign links by email. Sign from any device — phone, tablet, or desktop. No printing needed.' },
              { number: '03', title: 'Done — it\'s binding', description: 'The signed PDF is securely stored and emailed to both parties. Your Halal financing agreement is legally complete.' },
            ].map((step, i) => (
              <StepCard key={step.number} {...step} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTRACT TYPES ───────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#C9A84C' }}>Contract types</p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-white">
              Three structures.<br />All Shariah-compliant.
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">Choose the structure that fits your deal — sale or lease, cost-disclosed or negotiated.</p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-5">
            <ContractCard
              title="Murabaha" subtitle="Cost-Plus Financing" isHighlight delay={0.1}
              description="The seller discloses their purchase cost and agrees on a fixed profit margin. The most transparent and widely used Islamic finance structure."
              points={['Seller cost fully disclosed', 'Agreed markup percentage', 'Fixed installment schedule', 'Maximum 25% markup']}
            />
            <ContractCard
              title="Musawama" subtitle="Negotiated Price Sale" isHighlight={false} delay={0.2}
              description="Both parties negotiate a final price — no cost disclosure required. Equally Shariah-compliant. More privacy for the seller."
              points={['No cost disclosure needed', 'Negotiated selling price', 'Same payment structure', 'Flexible for both parties']}
            />
            <ContractCard
              title="Ijarah" subtitle="Islamic Lease" isHighlight={false} delay={0.3}
              badge="New"
              description="The lessor owns the vehicle and leases it to the lessee. Rental payments cover usufruct only. Optionally ends with ownership transfer (IMIT)."
              points={['Lessor retains ownership', 'Periodic rental (Ujrah)', 'Optional buy-out (IMIT)', 'AAOIFI Standard No. 9']}
            />
          </div>
        </div>
      </section>

      {/* ── LIVE CALCULATOR ─────────────────────────────────────── */}
      <LiveCalculator />

      {/* ── LATE FEE MECHANIC ────────────────────────────────────── */}
      <section className="py-24 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="rounded-2xl p-8 md:p-12 border border-white/8 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)' }} />
              <div className="text-4xl mb-6">🕌</div>
              <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-4">
                Late fees without Riba
              </h3>
              <p className="text-white/50 leading-relaxed mb-4">
                If a payment is more than 30 days late, a fixed daily fee applies — but <strong className="text-white/80">the seller does not keep it</strong>. It goes to a charity both parties agree on at signing.
              </p>
              <p className="text-white/50 leading-relaxed">
                This creates real accountability without the seller profiting from tardiness, which would constitute Riba. Common choices include Islamic Relief USA, Zakat Foundation, or a local masjid.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-white">Built for every scale</h2>
            <p className="text-white/40 mt-3">Contracts live in-platform. Access is always controlled. Cancel anytime.</p>
          </FadeUp>

          {/* Main tiers */}
          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <PricingCard name="Individual" price="$9.99" description="Personal peer-to-peer halal financing."
              delay={0.1} onStart={signUp}
              features={[
                { text: 'Unlimited contracts', available: true },
                { text: 'Murabaha & Musawama', available: true },
                { text: 'In-platform contract viewer', available: true },
                { text: 'Embedded e-signatures', available: true },
                { text: 'VIN lookup & recall check', available: true },
                { text: 'Team access (5 users)', available: false },
                { text: 'API access', available: false },
                { text: 'White-label branding', available: false },
              ]}
            />
            <PricingCard name="Business" price="$49" description="For dealers, lenders, and Islamic finance teams."
              highlight delay={0.2} onStart={signUp}
              features={[
                { text: 'Unlimited contracts', available: true },
                { text: 'Murabaha & Musawama', available: true },
                { text: 'In-platform contract viewer', available: true },
                { text: 'Embedded e-signatures', available: true },
                { text: 'VIN lookup & recall check', available: true },
                { text: 'Team access (5 users)', available: true },
                { text: 'API access', available: true },
                { text: 'White-label branding', available: false },
              ]}
            />
            <PricingCard name="Enterprise" price="$299" description="For institutions, banks, and BNPL platforms."
              enterprise delay={0.3} onStart={() => window.location.href = 'mailto:enterprise@aqadchain.com'}
              features={[
                { text: 'Unlimited contracts', available: true },
                { text: 'Murabaha & Musawama', available: true },
                { text: 'In-platform contract viewer', available: true },
                { text: 'Embedded e-signatures', available: true },
                { text: 'VIN lookup & recall check', available: true },
                { text: 'Unlimited team members', available: true },
                { text: 'API access + webhooks', available: true },
                { text: 'White-label branding', available: true },
              ]}
            />
          </div>

          {/* À la carte */}
          <FadeIn>
            <div className="rounded-2xl border border-white/8 overflow-hidden mb-5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="px-6 py-4 border-b border-white/6 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">À la carte add-ons</span>
                <span className="text-xs text-white/20">— pay only when you need it</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/6">
                {[
                  { icon: '✍️', name: 'E-signature', price: '$0.99', unit: 'per signature', desc: 'DocuSign embedded — parties sign inside the platform, never leave your app.' },
                  { icon: '📄', name: 'Certified Copy', price: '$4.99', unit: 'per download', desc: 'Watermarked PDF for legal records. One-time download, permanently logged.' },
                  { icon: '🔏', name: 'Notarization', price: '$49', unit: 'per contract', desc: 'We coordinate a licensed notary. Remote online notarization available.' },
                ].map((item) => (
                  <div key={item.name} className="px-6 py-5">
                    <div className="text-2xl mb-3">{item.icon}</div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-bold font-heading">{item.name}</span>
                      <span className="text-teal-400 font-bold text-sm">{item.price}</span>
                      <span className="text-white/30 text-xs">{item.unit}</span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Enterprise callout */}
          <FadeIn>
            <div className="rounded-2xl p-6 border flex flex-col md:flex-row items-center justify-between gap-6"
              style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#C9A84C' }}>Enterprise only</p>
                <p className="text-white font-semibold font-heading text-sm md:text-base">
                  White-label · Shariah board integration · Bulk import · Stripe + Plaid · CRM sync · Multi-language · SLA guarantee
                </p>
              </div>
              <motion.button
                onClick={() => window.location.href = 'mailto:enterprise@aqadchain.com'}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                Talk to sales →
              </motion.button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-4xl font-extrabold font-heading text-white">Questions</h2>
          </FadeUp>
          <div>
            {faqItems.map((item, i) => <FAQItem key={i} {...item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(13,110,99,0.2) 0%, transparent 70%)' }}
          />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <FadeUp>
            <h2 className="text-4xl md:text-5xl font-extrabold font-heading text-white mb-4">
              Ready to create your<br />first Halal contract?
            </h2>
            <p className="text-white/40 mb-10 text-lg">
              Join Muslim buyers and sellers using AqadChain for peace-of-mind vehicle financing.
            </p>
            <motion.button
              onClick={signUp}
              whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(13,110,99,0.6)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-xl font-bold text-base text-white"
              style={{ background: 'linear-gradient(135deg, #0D6E63, #0a5248)', boxShadow: '0 0 30px rgba(13,110,99,0.4)' }}
            >
              Start for free →
            </motion.button>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURED IN ──────────────────────────────────────────── */}
      <section className="py-14 border-t border-white/5 overflow-hidden">
        <p className="text-center text-white/20 text-xs font-semibold uppercase tracking-widest mb-8 px-4">As seen in</p>
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            className="flex gap-10 w-max"
          >
            {[...pressItems, ...pressItems].map(({ name, style }, i) => (
              <span key={i} className={`${style} text-white/20 hover:text-white/45 transition-colors duration-300 cursor-default select-none flex-shrink-0`}>
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CHARITY PARTNERS ─────────────────────────────────────── */}
      <section className="py-14 border-t border-white/5 overflow-hidden">
        <p className="text-center text-white/20 text-xs font-semibold uppercase tracking-widest mb-8 px-4">Late fees go to charity — choose from our partners</p>
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 w-max"
          >
            {[...charityItems, ...charityItems].map(({ name, icon }, i) => (
              <span key={i} className="flex items-center gap-1.5 text-white/20 hover:text-white/45 transition-colors duration-300 cursor-default select-none text-sm font-semibold flex-shrink-0">
                <span className="text-base">{icon}</span>{name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer dark />
    </div>
  );
}
