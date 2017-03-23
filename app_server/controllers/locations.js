var request               = require('request'),
    apiOptions            = {
      server: 'http://localhost:3000'
    };
if(process.env.NODE_ENV === 'production'){
  apiOptions.server   = 'https://boiling-springs-56587.herokuapp.com';
}
var path                  = '/api/locations',
    requestOptions        = {
      url: apiOptions.server + path,
      method: 'GET',
      json: {},
      qs: {
        // lng: -0.9690880,
        // lat: 51.455041,
        // Hindupur
        lng: 77.498873,
        lat: 13.8185378,
        // lng: -0.7992599,
        // lat: 51.278091,
        //// maxDistance in meters
        maxDistance: 9500
      }
    },
    renderHomepage        = function(req, res, responseBody){
      var message;
      if(!(responseBody instanceof Array)){
        message      = 'API lookup error';
        responseBody = [];
      } else if(!responseBody.length){
        message      = 'No places found nearby';
      }
      res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi',
        pageHeader: {
          title: 'Loc8r',
          strapline: 'Find places to work with wifi near you!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        message: message
        // locations: [{
        //   name: 'Starcups',
        //   address: '125 Hith Street, Reading, RG6 1PS',
        //   rating: 3,
        //   facilities: ['Hot drinks', 'Food', 'Premium wifi'],
        //   distance: '100m'
        // }, {
        //   name: 'Cafe Hero',
        //   address: '125 High Street,  Reading, RG6 1PS',
        //   rating: 4,
        //   facilities: ['Hot drinks', 'Food', 'Premium wifi'],
        //   distance: '200m'
        // }, {
        //   name: 'Burger Queen',
        //   address: '125 High Street, Reading, RG6 1PS',
        //   rating: 2,
        //   facilities: ['Hot drinks', 'Premium wifi'],
        //   distance: '250m'
        // }]
      });
    },
    _formatDistance       = function(distance){
      var numDistance, unit;
      if(distance > 1){
        numDistance = parseFloat(distance).toFixed(1);
        unit        = 'km';
      } else {
        numDistance = parseInt(distance * 1000, 10);
        unit        = 'm'
      }
      return numDistance + unit;
    }
    var renderDeatailesPage = function(req, res, locDetail){
      res.render('location-info', {
        title: locDetail.name,
        pageHeader: {title: locDetail.name},
        sidebar: {
          context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
          callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you'
        },
        location: locDetail
    // location: {
    //   name: 'Starcups',
    //   address: '125 High Street, Reading, RG6 1PS',
    //   rating: 3,
    //   facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //   coords: {lat: 51.455041, lng: -0.9690884},
    //   openingTimes: [{
    //     days: 'Monday - Friday',
    //     opening: '7:00am',
    //     closing: '7:00pm',
    //     closed: false
    //   }, {
    //     days: 'Saturday',
    //     opening: '8:00am',
    //     closing: '5:00pm',
    //     closed: false
    //   }, {
    //     days: 'Sunday',
    //     closed: true
    //   }],
    //   reviews: [{
    //     author: 'Viswanath Reddy',
    //     rating: 5,
    //     timestamp: '16 July 2013',
    //     reviewText: 'What a great place. I can\'t say enough good things about it.'
    //   }, {
    //     author: 'Simon Holmes',
    //     rating: 3,
    //     timestamp: '16 June 2013',
    //     reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
    //   }]
    // }
  });
};

var _showError            = function(req, res, status){
  var title, content;
  if(status === 404){
    title = "404, page not found";
    content = "Oh dear look like we can't find this page, sorry.";
  } else {
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  res.status(status);
  res.render('generic-text', {
    title: title,
    content: content
  });
};

var renderReviewForm      = function(req, res, locDetail){
  res.render('location-review-form', {
    title: 'Review ' + locDetail.name + ' on Loc8r',
    pageHeader: {
      title: 'Review ' + locDetail.name
    },
    error: req.query.err
  });
};

var getLocationInfo       = function(req, res, callback){
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };
  request(requestOptions, function(err, response, body){
    var data = body;
    if(response.statusCode === 200){
      data.coords = {
        lng: body.coords[0],
        lat: body.coords[1]
      };
      callback(req, res, data);
    } else {
      _showError(req, res, response.statusCode);
    }
  });
};


module.exports.homeList   = function(req, res) { 
  request(requestOptions, function(err, response, body){
    var i, data = body;
    for(i = 0; i < data.length; i++){
      data[i].distance = _formatDistance(data[i].distance);
    }
    renderHomepage(req, res, data);
    // console.log(response.body);
  })
};

module.exports.locationInfo = function(req, res) {
  getLocationInfo(req, res, function(req, res, responseData){
    renderDeatailesPage(req, res, responseData);
  });
};


module.exports.addReview = function(req, res) {
	getLocationInfo(req, res, function(req, res, responseData){
    renderReviewForm(req, res, responseData);
  });
};

module.exports.doAddReview = function(req, res){
  var postdata, path, requestOptions, locationid;
  locationid = req.params.locationid;
  path = '/api/locations/' + locationid + '/reviews';
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  requestOptions = {
    url: apiOptions.server + path,
    method: "POST",
    json: postdata
  };
  if(!postdata.author || !postdata.rating || !postdata.reviewText){
    res.redirect('/location/' + locationid + '/review/new?err=val');
  } else {
    request(requestOptions, function(err, response, body){
    if(response.statusCode === 201){
      res.redirect('/location/' + locationid);
    } else if(response.statusCode === 400 && body.name && body.name === 'ValidationError'){
      res.redirect('/location/' + locationid + '/review/new?err=val');
    } else {
      _showError(req, res, response.statusCode);
    }
    });
  }
};