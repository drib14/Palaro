const express = require('express');
const router = express.Router();
const { getProvinceRankings, getProvinceByName } = require('../controllers/provinceController');

router.get('/', getProvinceRankings);
router.get('/:name', getProvinceByName);

module.exports = router;
