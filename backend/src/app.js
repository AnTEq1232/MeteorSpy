const express = require('express');
const { getEarthCloseApproaches, getObjectCloseApproaches } = require('../api/Close-Approach_Data_API');
const app = express();

// Helper function to parse NASA API response
function parseCloseApproachData(apiResponse) {
  if (!apiResponse.data || apiResponse.count === 0) {
    return { count: 0, approaches: [] };
  }

  const fields = apiResponse.fields;
  const approaches = apiResponse.data.map(row => {
    const obj = {};
    fields.forEach((field, index) => {
      obj[field] = row[index];
    });
    return {
      name: obj.des,
      date: obj.cd,
      distance_au: parseFloat(obj.dist),
      distance_km: (parseFloat(obj.dist) * 149597870.7).toFixed(0), // AU to km
      distance_ld: (parseFloat(obj.dist) * 389.17).toFixed(2), // AU to Lunar Distance
      velocity_km_s: parseFloat(obj.v_rel),
      magnitude: parseFloat(obj.h),
      orbit_id: obj.orbit_id
    };
  });

  return {
    count: apiResponse.count,
    signature: apiResponse.signature,
    approaches
  };
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MeteorSpy API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Earth close approaches with optional query parameters
// GET /api/close-approaches?date-min=now&date-max=+60&dist-max=0.05&format=parsed
app.get('/api/close-approaches', async (req, res) => {
  try {
    const { 
      'date-min': dateMin = 'now',
      'date-max': dateMax = '+60',
      'dist-max': distMax = '0.05',
      'format': format = 'raw'
    } = req.query;
    
    const data = await getEarthCloseApproaches(dateMin, dateMax, distMax);
    
    if (format === 'parsed') {
      res.json(parseCloseApproachData(data));
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specific asteroid close approaches with optional query parameters
// GET /api/asteroid/:designation?date-min=2020-01-01&date-max=2030-12-31&dist-max=0.2&format=parsed
app.get('/api/asteroid/:designation', async (req, res) => {
  try {
    const { designation } = req.params;
    const {
      'date-min': dateMin = '1900-01-01',
      'date-max': dateMax = '2100-12-31',
      'dist-max': distMax = '1',
      'format': format = 'raw'
    } = req.query;
    
    const data = await getObjectCloseApproaches(designation, dateMin, dateMax, distMax);
    
    if (format === 'parsed') {
      res.json(parseCloseApproachData(data));
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search close approaches by name/designation
// GET /api/search?name=Apophis&format=parsed
app.get('/api/search', async (req, res) => {
  try {
    const {
      'name': name,
      'date-min': dateMin = '1900-01-01',
      'date-max': dateMax = '2100-12-31',
      'dist-max': distMax = '1',
      'format': format = 'parsed'
    } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Parameter "name" is required' });
    }
    
    // Map popular names to official designations
    const nameMapping = {
      'apophis': '99942',
      'eros': '433',
      'bennu': '101955',
      'ryugu': '162173',
      'didymos': '65803',
      'dimorphos': '65803',
      'halley': '1P',
      'halleya': '1P',
      'oumuamua': '1I',
      'borisov': '2I',
      'ceres': '1',
      'pallas': '2',
      'vesta': '4',
      'psyche': '16'
    };
    
    const searchName = nameMapping[name.toLowerCase()] || name;
    
    const data = await getObjectCloseApproaches(searchName, dateMin, dateMax, distMax);
    
    if (format === 'parsed') {
      res.json(parseCloseApproachData(data));
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
