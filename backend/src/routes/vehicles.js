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
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
