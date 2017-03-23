var express = require('express');
var router = express.Router();
var ctrlLocations   = require('../controllers/locations');
var ctrlOthers 		= require('../controllers/others');

// Define locations routes and mapping them to controllers functions
/* GET home page. */
router.get('/', ctrlLocations.homeList);

/* Get 'Location Info' page */
router.get('/location/:locationid', ctrlLocations.locationInfo);

/* Get 'Add Review' page */
router.get('/location/:locationid/review/new', ctrlLocations.addReview);

/* Post to API page */
router.post('/location/:locationid/review/new', ctrlLocations.doAddReview);


// Define others routes and mapping them to controllers functions
/* Get 'About' page */
router.get('/about', ctrlOthers.about);

module.exports = router;
