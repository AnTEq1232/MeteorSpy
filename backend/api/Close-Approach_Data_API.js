const BASE_URL = 'https://ssd-api.jpl.nasa.gov/cad.api';

/**
 * Get close-approach data from JPL SBDB API
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Close-approach data
 */
async function getCloseApproachData(params = {}) {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams(params);
    const url = `${BASE_URL}?${queryParams.toString()}`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching close-approach data:', error.message);
    throw error;
  }
}

/**
 * Get Earth close-approaches within specified distance and date range
 * @param {string} dateMin - Start date (YYYY-MM-DD or 'now')
 * @param {string} dateMax - End date (YYYY-MM-DD or '+60' for 60 days from now)
 * @param {string} distMax - Maximum distance (e.g., '0.05' in au or '10LD' for lunar distances)
 * @returns {Promise<Object>} Close-approach data
 */
async function getEarthCloseApproaches(dateMin = 'now', dateMax = '+60', distMax = '0.05') {
  return getCloseApproachData({
    'date-min': dateMin,
    'date-max': dateMax,
    'dist-max': distMax,
    'body': 'Earth',
    'sort': 'date'
  });
}

/**
 * Get close-approach data for a specific asteroid/comet
 * @param {string} designation - Object designation (e.g., '433', '2015 AB')
 * @param {string} dateMin - Start date (YYYY-MM-DD)
 * @param {string} dateMax - End date (YYYY-MM-DD)
 * @param {string} distMax - Maximum distance
 * @returns {Promise<Object>} Close-approach data
 */
async function getObjectCloseApproaches(designation, dateMin, dateMax, distMax = '1') {
  return getCloseApproachData({
    'des': designation,
    'date-min': dateMin,
    'date-max': dateMax,
    'dist-max': distMax,
    'fullname': true,
    'diameter': true
  });
}

module.exports = {
  getCloseApproachData,
  getEarthCloseApproaches,
  getObjectCloseApproaches
};