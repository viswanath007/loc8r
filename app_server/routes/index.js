var express = require('express');
var router = express.Router();
var ctrlLocations   = require('../controllers/locations');

/* GET home page. */
router.get('/', ctrlLocations.homeList);

module.exports = router;
