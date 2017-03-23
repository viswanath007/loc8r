var express       = require('express'),
    router        = express.Router(),

    // INCLUDE Controller Files
    ctrlLocations = require('../controllers/locations'),
    ctrlReviews   = require('../controllers/reviews');

    // DEFINE Routes for Locations and map them with associated controller functions
    router.get('/locations', ctrlLocations.locationsListByDistance);
    router.post('/locations', ctrlLocations.locationsCreate);
    router.get('/locations/:locationid', ctrlLocations.locationsReadOne);
    router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
    router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);

    // DEFINE Routes for Reviews and map them with associated controller functions
    router.post('/locations/:locationid/reviews', ctrlReviews.reviewsCreate);
    router.get('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
    router.put('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsUpdateOne);
    router.delete('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsDeleteOne);

// Export Routes
module.exports     = router;