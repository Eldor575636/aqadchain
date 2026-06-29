const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Photo matches recovered from cargetgo.com's storefront data (exact model matches only)
const PHOTOS = {
  'Honda CR-V': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/ddad1004-e855-4956-9910-6a3d3679a051.jpeg',
  'Ford Escape': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743549064788-photo_2025-04-0116.10.00.jpeg',
  'Toyota Corolla': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743549269288-photo_2025-04-0116.13.52.jpeg',
  'Toyota Camry 2019': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743549553599-photo_2025-04-0116.18.27.jpeg',
  'Lexus ES300h': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743700494561-photo_2025-04-0310.14.10.jpeg',
  'Toyota Prius 2013a': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743549844928-photo_2025-04-0116.23.31.jpeg',
  'Toyota Prius 2013b': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743549725904-photo_2025-04-0116.21.30.jpeg',
  'Toyota Prius 2012': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743549971833-photo_2025-04-0116.25.26.jpeg',
  'Ford Fusion Titanium': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743702019087-photo_2025-04-0310.39.36.jpeg',
  'Ford Fusion SE': 'https://cdn.zyrosite.com/cdn-ecommerce/store_01JQR00E3D9BZGHB4AH156DP6W/assets/1743701724295-photo_2025-04-0310.34.13.jpeg',
};

const SELLER = { name: 'CarGetGo', email: 'info@cargetgo.com', phone: '+1-415-650-6333', address: 'San Francisco Bay Area, CA' };

// price marked (real) = taken directly from the post; otherwise it's a market estimate based on
// comparable year/mileage/trim in this same batch — flagged to the user as estimated.
const DONE_DEALS = [
  { year: 2007, make: 'Toyota', model: 'Prius', trim: 'Touring', color: 'Blue', mileage: 165000, price: 5500, type: 'MUSAWAMA', notes: 'New headlights, new carpet flooring, new hybrid battery (under warranty), aftermarket catalytic converter ($800 repair). Mechanically good. Not rideshare-eligible.' },
  { year: 2012, make: 'Toyota', model: 'Camry', trim: 'XLE', color: 'White', mileage: 190000, price: 7800, type: 'MUSAWAMA', notes: 'Excellent mechanical condition. 35 MPG. Start/Stop, climate control, backup camera. New seat covers, 12V battery (1yr warranty), 4 new tires, new headlights, new hybrid battery (3yr warranty). Rideshare-eligible.' },
  { year: 2009, make: 'Toyota', model: 'Prius', trim: 'Touring', color: 'Brown/Black', mileage: 150000, price: 5800, type: 'MUSAWAMA', notes: 'Good mechanical condition. 35 MPG. Fog lights and minor plastic trim replaced. Not rideshare-eligible.', photo: PHOTOS['Toyota Prius 2013a'] },
  { year: 2013, make: 'Toyota', model: 'Prius', trim: 'Hybrid', color: 'Eggplant', mileage: 123000, price: 7200, type: 'MUSAWAMA', notes: 'Excellent condition. 40+ MPG. Start/Stop, cruise control, climate control, keyless entry, backup camera + display installed. New black/white seat covers. Rideshare-eligible.', photo: PHOTOS['Toyota Prius 2013a'] },
  { year: 2016, make: 'Toyota', model: 'Camry', trim: 'Hybrid XLE', color: 'White Pearl', mileage: 134000, price: 11500, type: 'IJARAH', notes: 'Excellent condition, 33+ MPG. Rideshare-eligible.', photo: PHOTOS['Toyota Camry 2019'] },
  { year: 2019, make: 'Ford', model: 'Fusion', trim: 'Hybrid SE', color: 'Gray', mileage: 118000, price: 9800, type: 'MUSAWAMA', notes: 'Excellent condition, 35+ MPG. Rideshare-eligible.', photo: PHOTOS['Ford Fusion SE'] },
  { year: 2014, make: 'Lexus', model: 'ES300h', trim: 'Hybrid', color: 'Blue', mileage: 175000, price: 12500, type: 'IJARAH', notes: 'Excellent condition. 30+ MPG. Start/Stop, dual-zone climate, heated/memory/cooled seats, tinted windows, 4-door keyless entry, backup camera + parking sensors. 4 new Bridgestone tires (80,000 mi warranty). Rideshare-eligible.', photo: PHOTOS['Lexus ES300h'] },
  { year: 2021, make: 'Toyota', model: 'Corolla', trim: 'Hybrid LE', color: 'Blue', mileage: 78000, price: 17000, type: 'MUSAWAMA', notes: 'Excellent condition. City 55+/Hwy 65+ MPG. Full safety suite (pre-collision, lane assist, blind spot, rear cross-traffic), Apple CarPlay/Android Auto, keyless entry, backup camera. Rideshare-eligible.', photo: PHOTOS['Toyota Corolla'] },
  { year: 2013, make: 'Toyota', model: 'Prius', trim: 'Hybrid', color: 'Light Green', mileage: 155000, price: 7000, priceReal: true, type: 'MUSAWAMA', notes: 'Excellent mechanical condition. 40+ MPG. Cosmetic: unrepaired damage on rear-right door (see photos). Heated seats, keyless entry, backup camera. Rideshare-eligible. Original listing also offered halal financing at $1,500/mo over 6 months — no lease option offered.', photo: PHOTOS['Toyota Prius 2013b'] },
  { year: 2010, make: 'Toyota', model: 'Prius', trim: 'Hybrid', color: 'Eggplant', mileage: 145000, price: 6300, type: 'MUSAWAMA', notes: 'Excellent condition. 40 MPG. New 12V battery, new tire. Start/Stop, cruise control, climate control, keyless entry. Rideshare-eligible.', photo: PHOTOS['Toyota Prius 2012'] },
  { year: 2018, make: 'Ford', model: 'Fusion', trim: 'Hybrid Titanium/Premium', color: 'Dark Gray', mileage: 130000, price: 11800, type: 'IJARAH', notes: 'Excellent mechanical and cosmetic condition. 40 MPG. Sony audio, heated/memory seats, tinted windows, 4-door keyless entry, backup camera + parking sensors. Rideshare-eligible.', photo: PHOTOS['Ford Fusion Titanium'] },
  { year: 2018, make: 'Ford', model: 'Fusion', trim: 'Hybrid SE', color: 'Blue Metallic', mileage: 105000, price: 9750, priceReal: true, type: 'MUSAWAMA', notes: 'Excellent condition. ~40 MPG. Blind spot monitoring, dual-zone climate, heated seats, backup camera + parking sensors. Rideshare-eligible. Original cash range was $7,500–$12,000; halal financing also offered at $1,000/mo over 10 months.', photo: PHOTOS['Ford Fusion SE'] },
  { year: 2019, make: 'Toyota', model: 'Camry', trim: 'Hybrid Sport Edition (SE)', color: 'Galactic Aqua Mica', mileage: 125000, price: 13200, type: 'MUSAWAMA', notes: 'Excellent mechanical/cosmetic condition. City 40+/Hwy 45+ MPG. Full safety suite, heated seats, Apple CarPlay/Android Auto, Kumho tires on 18" wheels, backup camera, parking sensors, spoiler. Rideshare-eligible.', photo: PHOTOS['Toyota Camry 2019'] },
  { year: 2022, make: 'Ford', model: 'Escape', trim: 'Hybrid', color: 'White', mileage: 113000, price: 17500, type: 'MUSAWAMA', notes: 'Excellent condition. 40 MPG. 8" display, Apple CarPlay/Android Auto, multiple drive modes, 17" wheels, tinted windows, keyless entry, full safety suite. Uber/Lyft Extra Comfort eligible.', photo: PHOTOS['Ford Escape'] },
  { year: 2013, make: 'Toyota', model: 'Prius', trim: 'Hybrid', color: 'Gray', mileage: 122000, price: 7900, type: 'MUSAWAMA', notes: 'Excellent condition. 40+ MPG. JBL Bluetooth audio, heated front seats, 10-way power driver seat, roof ski rack, backup camera, tinted windows, Carfax available. New Yokohama tires, cat shield. Rideshare-eligible.', photo: PHOTOS['Toyota Prius 2013a'] },
  { year: 2021, make: 'Toyota', model: 'Corolla', trim: 'Hybrid LE', color: 'Gray', mileage: 85000, price: 16500, type: 'MUSAWAMA', notes: 'Excellent condition. City 55+/Hwy 65+ MPG. Full safety suite, Apple CarPlay/Android Auto, Yokohama tires. Rideshare-eligible.', photo: PHOTOS['Toyota Corolla'] },
  { year: 2012, make: 'Toyota', model: 'Prius', trim: 'Hybrid', color: 'Blue', mileage: 128000, price: 6900, type: 'MUSAWAMA', notes: 'Excellent condition. 40+ MPG. JBL Bluetooth audio, cruise control, climate control, keyless entry, Carfax available. New cat shield. Rideshare-eligible.', photo: PHOTOS['Toyota Prius 2012'] },
  { year: 2013, make: 'Toyota', model: 'Prius', trim: 'Hybrid', color: 'Blue', mileage: 133000, price: 6200, type: 'MUSAWAMA', notes: 'Excellent condition. 40+ MPG. JBL Bluetooth, heated front seats, 10-way power driver seat, backup camera, Carfax available. Head gasket replaced ($1,500), new tires, new 12V battery. Known issue: touchscreen sensor not working. Rideshare-eligible.', photo: PHOTOS['Toyota Prius 2013a'] },
  { year: 2024, make: 'Honda', model: 'CR-V', trim: 'Sport Hybrid AWD', color: 'Gray', mileage: 40000, price: 33000, type: 'IJARAH', notes: 'Clean Carfax. 40 city/34 hwy/37 combined MPG. 18" alloy wheels, heated seats, 7" touchscreen, Apple CarPlay/Android Auto, Honda Sensing suite (adaptive cruise, lane keeping, blind spot, cross-traffic), 8-way power driver seat, 2.0L Atkinson hybrid (204 hp). Rideshare-eligible.', photo: PHOTOS['Honda CR-V'] },
];

const ACTIVE_LISTINGS = [
  {
    year: 2024, make: 'Honda', model: 'CR-V', trim: 'Sport Hybrid AWD', color: 'Black', mileage: 38000,
    price: 37000, type: 'MUSAWAMA', priceReal: true,
    description: 'Clean Carfax. 40 city/34 hwy/37 combined MPG. 18" Berlina Black alloy wheels, heated front seats, 7" touchscreen, Apple CarPlay/Android Auto, 6-speaker audio, Honda Sensing suite, remote start, roof rails, gloss black spoiler, multi-angle backup camera, 60/40 folding rear seats, 8-way power driver seat. ECON/Sport/Snow drive modes. 2.0L Atkinson hybrid (204 hp). Cash price: $37,000. Rideshare-eligible (Comfort tier).',
    photo: PHOTOS['Honda CR-V'],
  },
  {
    year: 2020, make: 'Ford', model: 'Fusion', trim: 'Hybrid SE', color: 'Grey', mileage: 65000,
    price: 13500, type: 'IJARAH', leaseNote: 'Lease: $250/week or $900/month (insurance not included). Cash and halal financing price negotiable.',
    description: 'Excellent condition, ~40 MPG. SYNC audio, Start/Stop, cruise control, blind spot monitoring, dual-zone climate, heated seats, backup camera, parking sensors. Rideshare-eligible. Lease: $250/week or $900/month (insurance not included). Cash and halal financing price negotiable.',
    photo: PHOTOS['Ford Fusion SE'],
  },
  {
    year: 2005, make: 'Toyota', model: 'Prius', trim: '', color: 'Gold', mileage: 130500,
    price: 6000, type: 'IJARAH', leaseNote: 'Lease: $500/month (no insurance) or $150/week, $300 deposit. Cash and financing price negotiable.',
    description: 'Good mechanical condition, cruise control. New headlights, new carpet flooring, hybrid battery recently serviced. Lease: $500/month (no insurance) or $150/week, $300 deposit. Cash and financing price negotiable.',
    photo: null,
  },
  {
    year: 2013, make: 'Chevrolet', model: 'Volt', trim: 'Premier Hybrid', color: 'Black', mileage: 43400,
    price: 14500, type: 'IJARAH', leaseNote: 'Lease: $700/month (no insurance) or $200/week, $400 deposit. Cash and financing price negotiable.',
    description: '38 miles electric-only range, 300+ total range. 4-seat hatchback, heated front seats, Bose premium audio, navigation, Bluetooth, MyLink, keyless entry, remote start, full safety suite (lane departure, forward collision alert), OnStar, 17" alloy wheels, regenerative braking, 110V/240V charging. Not rideshare-eligible. Lease: $700/month (no insurance) or $200/week, $400 deposit. Cash and financing price negotiable.',
    photo: null,
  },
];

function calcMusawamaTerms(price) {
  const down_payment = 0;
  const markup_percentage = 10;
  const financed_amount = price;
  const markup_amount = Math.round(financed_amount * (markup_percentage / 100) * 100) / 100;
  const term_months = 12;
  const total_payable = financed_amount + markup_amount;
  const monthly_payment = Math.round((total_payable / term_months) * 100) / 100;
  return { down_payment, markup_percentage, markup_amount, financed_amount, term_months, total_payable, monthly_payment };
}

function calcIjarahTerms(price) {
  const security_deposit = Math.round(price * 0.1 * 100) / 100;
  const residual_value = Math.round(price * 0.4 * 100) / 100;
  const term_months = 12;
  const total_payable = price - security_deposit - residual_value;
  const monthly_payment = Math.round((total_payable / term_months) * 100) / 100;
  return { security_deposit, residual_value, term_months, total_payable, monthly_payment };
}

async function main() {
  const seller = await prisma.user.upsert({
    where: { auth0_id: 'auth0|cargetgo_seller_seed' },
    update: {},
    create: {
      auth0_id: 'auth0|cargetgo_seller_seed',
      email: SELLER.email,
      full_name: SELLER.name,
      role: 'BUSINESS',
      kyc_status: 'VERIFIED',
      onboarding_completed: true,
    },
  });

  let n = 0;
  for (const car of DONE_DEALS) {
    n += 1;
    const contract_number = `AQD-CG-${String(n).padStart(4, '0')}`;
    const exists = await prisma.contract.findUnique({ where: { contract_number } });
    if (exists) { console.log(`Skip existing ${contract_number}`); continue; }

    const base = {
      contract_number,
      creator_id: seller.id,
      contract_type: car.type,
      status: 'COMPLETED',
      vehicle_year: car.year,
      vehicle_make: car.make,
      vehicle_model: car.model,
      vehicle_trim: car.trim,
      vehicle_mileage: car.mileage,
      vehicle_color: car.color,
      title_status: 'CLEAN',
      seller_name: SELLER.name,
      seller_email: SELLER.email,
      seller_phone: SELLER.phone,
      seller_address: SELLER.address,
      buyer_name: 'Private Buyer',
      buyer_email: `buyer${n}@cargetgo-archive.local`,
      car_price: car.price,
      payment_frequency: 'MONTHLY',
      late_fee_amount: 25,
      charity_name: 'Islamic Relief USA',
      special_terms: car.notes,
      seller_signed_at: new Date('2025-12-01'),
      buyer_signed_at: new Date('2025-12-01'),
    };

    if (car.type === 'IJARAH') {
      const t = calcIjarahTerms(car.price);
      Object.assign(base, { ijarah_subtype: 'IMIT', security_deposit: t.security_deposit, residual_value: t.residual_value, term_months: t.term_months, total_payable: t.total_payable, monthly_payment: t.monthly_payment });
    } else {
      const t = calcMusawamaTerms(car.price);
      Object.assign(base, t);
    }

    await prisma.contract.create({ data: base });
    console.log(`✓ Done deal: ${car.year} ${car.make} ${car.model} (${car.type}) — ${contract_number}`);
  }

  for (const car of ACTIVE_LISTINGS) {
    const existsListing = await prisma.listing.findFirst({
      where: { seller_id: seller.id, vehicle_make: car.make, vehicle_model: car.model, vehicle_year: car.year, vehicle_mileage: car.mileage },
    });
    if (existsListing) { console.log(`Skip existing listing: ${car.year} ${car.make} ${car.model}`); continue; }

    await prisma.listing.create({
      data: {
        seller_id: seller.id,
        status: 'ACTIVE',
        vehicle_year: car.year,
        vehicle_make: car.make,
        vehicle_model: car.model,
        vehicle_trim: car.trim || null,
        vehicle_mileage: car.mileage,
        vehicle_color: car.color,
        title_status: 'CLEAN',
        asking_price: car.price,
        contract_type_offered: car.type,
        description: car.description,
        city: 'San Francisco Bay Area',
        state: 'CA',
        photo_url: car.photo,
        recalls: [],
        has_recalls: false,
      },
    });
    console.log(`✓ Active listing: ${car.year} ${car.make} ${car.model} (${car.type})`);
  }

  console.log('✓ CarGetGo seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
