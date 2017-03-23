var mongoose          = require('mongoose'),
    Loc               = mongoose.model('Location'),

    theEarth          = (function(){
      var earthRadius = 6371,
          getDistanceFromRads = function(rads){
            // radians will be in meters ===
            // return parseFloat(rads * earthRadius);
            return parseFloat(rads / 1000);
          },
          getRadsFromDistance = function(distance){
            return parseFloat(distance * 1000);
          };
      return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
      };
    })(),

    buildLocationList     = function(req, res, results, stats){
      var locations = [];
      results.forEach(function(doc){
        locations.push({
          distance: theEarth.getDistanceFromRads(doc.dis),
          // distance: doc.dis,
          name: doc.obj.name,
          address: doc.obj.address,
          rating: doc.obj.rating,
          facilities: doc.obj.facilities,
          _id: doc.obj._id
        });
      });
      return locations;
    },

    sendJsonResponse      = function (res, status, content) {
      res.status(status);
      res.json(content);
    };

module.exports.locationsCreate    = function (req, res) {
  // sendJsonResponse(res, 200, {"status": "success"});
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed:req.body.closed1
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2
    }]
  }, function(err, location){
    if(err){
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, location);
    }
  });
};

module.exports.locationsListByDistance = function(req, res){
  var lng         = parseFloat(req.query.lng),
      lat         = parseFloat(req.query.lat),
      maxDistance = parseFloat(req.query.maxDistance),
      point     = {
    type: "Point",
    coordinates: [lng, lat]
      },
      geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance),
        num: 10
      };
  if((!lng && lng!==0) || (!lat && lat!==0)){
    sendJsonResponse(res, 404, {
      "message": "lng & lat query params are required"
    });
    return;
  }
  Loc
     .geoNear(point, geoOptions, function(err, results, stats){
      if(err){
        sendJsonResponse(res, 404, err);
      } else {
        locations = buildLocationList(req, res, results, stats);
        sendJsonResponse(res, 200, locations)
      }
     });
};

module.exports.locationsReadOne = function(req, res){
  if(req.params && req.params.locationid){
    Loc
      .findById(req.params.locationid)
      .exec(function(err, location){
        if(!location){
          sendJsonResponse(res, 404, {
            "message": "locationid not found"});
          return;
        } else if(err){
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, location);
    });
  } else {
    sendJsonResponse(res, 404, {
      "message": "No locationid in request"
    });
  }
};

module.exports.locationsUpdateOne = function(req, res){
  // sendJsonResponse(res, 200, {"status": "success"});
  var locationid = req.params.locationid;
  if(!locationid){
    sendJsonResponse(res, 404, {
      "message": "not found, locationid required"
    });
    return;
  }
  Loc
     .findById(locationid)
     .select('-reviews -rating')
     .exec(function(err, location){
      if(!location){
        sendJsonResponse(res, 404, {
          "message": "locationid not found"
        });
        return;
      } else if(err){
        sendJsonResponse(res, 400, err);
        return;
      }
      location.name     = req.body.name;
      location.address  = req.body.address;
      location.facilities = req.body.facilities.split(",");
      location.coords   = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
      location.openingTimes = [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1
      }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2
      }];
      location.save(function(err, location){
        if(err){
          sendJsonResponse(res, 404, err);
        } else {
          sendJsonResponse(res, 200, location);
        }
      });
     });
};

module.exports.locationsDeleteOne = function(req, res){
  // sendJsonResponse(res, 200, {"status": "success"});
  var locationid = req.params.locationid;
  if(!locationid){
    sendJsonResponse(res, 404, {
      "message": "not found, locationid required"
    });
    return;
  }
  Loc
     .findByIdAndRemove(locationid)
     .exec(function(err, location){
      if(err){
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 204, null);
     });
};