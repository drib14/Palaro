const Province = require('../models/Province');

const getProvinceRankings = async (req, res, next) => {
  try {
    const { region, sortBy = 'totalPoints', limit = 82 } = req.query;
    const filter = {};
    if (region) filter.region = region;

    const provinces = await Province.find(filter)
      .sort({ [sortBy]: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: { provinces } });
  } catch (error) { next(error); }
};

const getProvinceByName = async (req, res, next) => {
  try {
    const province = await Province.findOne({ name: req.params.name })
      .populate('topPlayers.userId', 'username avatar level');

    if (!province) return res.status(404).json({ success: false, message: 'Province not found.' });
    res.json({ success: true, data: { province } });
  } catch (error) { next(error); }
};

module.exports = { getProvinceRankings, getProvinceByName };
