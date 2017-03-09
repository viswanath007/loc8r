var express = require('express');
var router = express.Router();
var ctrlLocations   = require('../controllers/locations');
var ctrlOthers 		= require('../controllers/others');

// Define locations routes and mapping them to controllers functions
/* GET home page. */
router.get('/', ctrlLocations.homeList);

/* Get 'Location Info' page */
router.get('/location', ctrlLocations.locationInfo);

/* Get 'Add Review' page */
router.get('/location/review/new', ctrlLocations.addReview);


// Define others routes and mapping them to controllers functions
/* Get 'About' page */
router.get('/about', ctrlOthers.about);

module.exports = router;
