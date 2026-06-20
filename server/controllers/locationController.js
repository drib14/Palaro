const axios = require('axios');

// @desc    Autocomplete locations using LocationIQ
// @route   GET /api/location/search
// @access  Public
const searchLocation = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, locations: [] });
    }

    const token = process.env.LOCATIONIQ_ACCESS_TOKEN;
    if (!token) {
      console.warn('⚠️ LocationIQ Access Token not configured on server');
      return res.status(500).json({ success: false, message: 'Location search not configured' });
    }

    // Call LocationIQ Geocoding Search/Autocomplete endpoint
    // Limit to Philippines by adding countrycodes=ph
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: token,
        q: q.trim(),
        format: 'json',
        countrycodes: 'ph', // restrict to Philippines
        limit: 5,
      },
    });

    if (response.data && Array.isArray(response.data)) {
      const locations = response.data.map(item => ({
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }));
      return res.json({ success: true, locations });
    }

    res.json({ success: true, locations: [] });
  } catch (error) {
    // If LocationIQ returns no results (404), return empty array
    if (error.response && error.response.status === 404) {
      return res.json({ success: true, locations: [] });
    }
    next(error);
  }
};

module.exports = { searchLocation };
