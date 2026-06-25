const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listings = [
  {
    vehicle_year: 2022, vehicle_make: 'Toyota', vehicle_model: 'Camry', vehicle_trim: 'XLE',
    vehicle_mileage: 18500, vehicle_color: 'Silver', title_status: 'CLEAN',
    asking_price: 24500, contract_type_offered: 'MURABAHA',
    description: 'Well-maintained, single owner, all service records available. Non-smoker vehicle.',
    city: 'San Francisco', state: 'CA', zip: '94102',
    photo_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&q=80',
  },
  {
    vehicle_year: 2023, vehicle_make: 'Honda', vehicle_model: 'CR-V', vehicle_trim: 'EX-L',
    vehicle_mileage: 9200, vehicle_color: 'White', title_status: 'CLEAN',
    asking_price: 31900, contract_type_offered: 'MUSAWAMA',
    description: 'Like-new SUV, still under factory warranty. Garage kept.',
    city: 'San Jose', state: 'CA', zip: '95110',
    photo_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80',
  },
  {
    vehicle_year: 2021, vehicle_make: 'Ford', vehicle_model: 'F-150', vehicle_trim: 'XLT',
    vehicle_mileage: 32000, vehicle_color: 'Blue', title_status: 'CLEAN',
    asking_price: 36800, contract_type_offered: 'IJARAH',
    description: 'Great work truck, tow package included. Available for lease with option to buy.',
    city: 'Oakland', state: 'CA', zip: '94612',
    photo_url: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=900&q=80',
  },
  {
    vehicle_year: 2023, vehicle_make: 'Tesla', vehicle_model: 'Model Y', vehicle_trim: 'Long Range',
    vehicle_mileage: 5400, vehicle_color: 'Black', title_status: 'CLEAN',
    asking_price: 44900, contract_type_offered: 'MURABAHA',
    description: 'Nearly new, full self-driving capability included. Premium interior.',
    city: 'Palo Alto', state: 'CA', zip: '94301',
    photo_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80',
  },
  {
    vehicle_year: 2020, vehicle_make: 'BMW', vehicle_model: 'X5', vehicle_trim: 'xDrive40i',
    vehicle_mileage: 41000, vehicle_color: 'Gray', title_status: 'CLEAN',
    asking_price: 39500, contract_type_offered: 'MUSAWAMA',
    description: 'Luxury SUV with premium package, panoramic sunroof, and 360 camera.',
    city: 'Berkeley', state: 'CA', zip: '94704',
    photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80',
  },
  {
    vehicle_year: 2022, vehicle_make: 'Chevrolet', vehicle_model: 'Tahoe', vehicle_trim: 'LT',
    vehicle_mileage: 22800, vehicle_color: 'Black', title_status: 'CLEAN',
    asking_price: 47200, contract_type_offered: 'IJARAH',
    description: 'Spacious family SUV, 3rd row seating, tow capacity 8,400 lbs.',
    city: 'Fremont', state: 'CA', zip: '94536',
    photo_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80',
  },
  {
    vehicle_year: 2023, vehicle_make: 'Lexus', vehicle_model: 'RX 350', vehicle_trim: 'Premium',
    vehicle_mileage: 11200, vehicle_color: 'Pearl White', title_status: 'CLEAN',
    asking_price: 33400, contract_type_offered: 'MURABAHA',
    description: 'Certified pre-owned, extended warranty transferable to new owner.',
    city: 'San Mateo', state: 'CA', zip: '94401',
    photo_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80',
  },
  {
    vehicle_year: 2021, vehicle_make: 'Jeep', vehicle_model: 'Wrangler', vehicle_trim: 'Rubicon',
    vehicle_mileage: 28500, vehicle_color: 'Red', title_status: 'CLEAN',
    asking_price: 38900, contract_type_offered: 'MUSAWAMA',
    description: 'Off-road ready, removable doors and top, recently serviced.',
    city: 'Santa Clara', state: 'CA', zip: '95050',
    photo_url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=900&q=80',
  },
];

async function main() {
  const seller = await prisma.user.upsert({
    where: { auth0_id: 'auth0|demo_seller_seed' },
    update: {},
    create: {
      auth0_id: 'auth0|demo_seller_seed',
      email: 'demoseller@aqadchain.com',
      full_name: 'AqadChain Verified Seller',
      role: 'INDIVIDUAL',
      kyc_status: 'VERIFIED',
      onboarding_completed: true,
    },
  });

  for (const l of listings) {
    const exists = await prisma.listing.findFirst({
      where: { seller_id: seller.id, vehicle_make: l.vehicle_make, vehicle_model: l.vehicle_model, vehicle_year: l.vehicle_year },
    });
    if (exists) { console.log(`Skipping existing: ${l.vehicle_year} ${l.vehicle_make} ${l.vehicle_model}`); continue; }

    await prisma.listing.create({
      data: { ...l, seller_id: seller.id, status: 'ACTIVE', recalls: [], has_recalls: false },
    });
    console.log(`✓ Created: ${l.vehicle_year} ${l.vehicle_make} ${l.vehicle_model}`);
  }

  console.log('✓ Listing seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
