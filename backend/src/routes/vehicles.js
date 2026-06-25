const router = require('express').Router();
const axios = require('axios');
const { requireAuth } = require('../middleware/auth');

// GET /api/vehicles/lookup?vin=XXXXX
router.get('/lookup', requireAuth, async (req, res, next) => {
  try {
    const { vin } = req.query;
    if (!vin || vin.length !== 17) {
      return res.status(400).json({ error: 'A valid 17-character VIN is required' });
    }

    const vinUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
    const vinResponse = await axios.get(vinUrl, { timeout: 8000 });
    const result = vinResponse.data?.Results?.[0];

    if (!result || result.ErrorCode !== '0') {
      return res.status(400).json({ error: 'VIN not found or invalid', details: result?.ErrorText });
    }

    const year = parseInt(result.ModelYear);
    const make = result.Make;
    const model = result.Model;
    const trim = result.Trim || result.Series || '';
    const bodyClass = result.BodyClass;
    const fuelType = result.FuelTypePrimary;
    const driveType = result.DriveType;
    const engineCylinders = result.EngineCylinders;
    const displacementL = result.DisplacementL;

    // Fetch recalls for this vehicle
    let recalls = [];
    if (make && model && year) {
      try {
        const recallUrl = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
        const recallResponse = await axios.get(recallUrl, { timeout: 8000 });
        recalls = recallResponse.data?.results || [];
      } catch {
        // Recall lookup is non-critical — don't fail the whole request
      }
    }

    // Market value estimate (optional — only if AUTO_DEV_API_KEY is configured)
    let marketValue = null;
    if (process.env.AUTO_DEV_API_KEY) {
      try {
        const valueResponse = await axios.get(`https://auto.dev/api/vin/${encodeURIComponent(vin)}`, {
          headers: { Authorization: `Bearer ${process.env.AUTO_DEV_API_KEY}` },
          timeout: 8000,
        });
        const priceData = valueResponse.data?.price || valueResponse.data?.marketValue;
        if (priceData) marketValue = priceData;
      } catch {
        // Market value lookup is non-critical — don't fail the whole request
      }
    }

    res.json({
      vin,
      year,
      make,
      model,
      trim,
      body_class: bodyClass,
      fuel_type: fuelType,
      drive_type: driveType,
      engine_cylinders: engineCylinders,
      displacement_l: displacementL,
      recalls: recalls.map((r) => ({
        component: r.Component,
        summary: r.Summary,
        consequence: r.Consequence,
        remedy: r.Remedy,
        campaign_number: r.NHTSACampaignNumber,
      })),
      has_recalls: recalls.length > 0,
      market_value: marketValue,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/fuel-economy?year=&make=&model=
router.get('/fuel-economy', requireAuth, async (req, res, next) => {
  try {
    const { year, make, model } = req.query;
    if (!year || !make || !model) {
      return res.status(400).json({ error: 'year, make, and model are required' });
    }

    const menuUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    const menuResponse = await axios.get(menuUrl, { timeout: 8000, headers: { Accept: 'application/json' } });
    let options = menuResponse.data?.menuItem;
    if (!options) return res.json({ found: false });
    if (!Array.isArray(options)) options = [options];

    const vehicleId = options[0]?.value;
    if (!vehicleId) return res.json({ found: false });

    const detailUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`;
    const detailResponse = await axios.get(detailUrl, { timeout: 8000, headers: { Accept: 'application/json' } });
    const d = detailResponse.data;

    res.json({
      found: true,
      city_mpg: d.city08,
      highway_mpg: d.highway08,
      combined_mpg: d.comb08,
      fuel_type: d.fuelType1,
      co2_emissions_g_mi: d.co2TailpipeGpm,
      annual_fuel_cost: d.fuelCost08,
      cylinders: d.cylinders,
      transmission: d.trany,
      drive: d.drive,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/photo?year=&make=&model=
router.get('/photo', requireAuth, async (req, res, next) => {
  try {
    const { year, make, model } = req.query;
    if (!make || !model) {
      return res.status(400).json({ error: 'make and model are required' });
    }
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return res.json({ found: false, reason: 'Unsplash not configured' });
    }

    const query = `${year || ''} ${make} ${model} car`.trim();
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const response = await axios.get(searchUrl, {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      timeout: 8000,
    });

    const photo = response.data?.results?.[0];
    if (!photo) return res.json({ found: false });

    res.json({
      found: true,
      url: photo.urls?.regular,
      thumb: photo.urls?.small,
      credit_name: photo.user?.name,
      credit_url: photo.user?.links?.html,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
