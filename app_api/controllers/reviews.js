var mongoose          = require('mongoose'),
    Loc               = mongoose.model('Location'),

    sendJsonResponse      = function (res, status, content) {
      res.status(status);
      res.json(content);
    },

    updateAverageRating   = function(locationid){
      Loc
         .findById(locationid)
         .select('rating reviews')
         .exec(function(err, location){
          if(!err){
            doSetAverageRating(location);
          }
         });
    },

    doSetAverageRating = function(location){
      var i, reviewCount, ratingAverage, ratingTotal;
      if(location.reviews && location.reviews.length > 0){
        reviewCount = location.reviews.length;
      ratingTotal = 0;
      for(i = 0; i < reviewCount; i++){
        ratingTotal += location.reviews[i].rating;
      }
      ratingAverage = parseInt(ratingTotal / reviewCount, 10);
      location.rating = ratingAverage;
      location.save(function(err){
        if(err){
          console.log(err);
        } else {
          console.log('Avg rating updated to ' + ratingAverage);
         }
      });
      }
    },

    doAddReview     = function(req, res, location){
      if(!location){
        sendJsonResponse(res, 404, {
          "message": "Not found, locationid required"
        });
      } else {
        location.reviews.push({
          author: req.body.author,
          rating: req.body.rating,
          reviewText: req.body.reviewText
        });
        location.save(function(err, location){
          var thisReview;
          if(err){
            sendJsonResponse(res, 400, err);
          } else {
            updateAverageRating(location._id);
            thisReview = location.reviews[location.reviews.length - 1];
            sendJsonResponse(res, 201, thisReview);
          }
        });
      }
    };

module.exports.reviewsCreate = function(req, res){
  // sendJsonResponse(res, 200, {"status": "success"});
  var locationid = req.params.locationid;
  if(locationid){
    Loc
       .findById(locationid)
       .select('reviews')
       .exec(function(err, location){
        if(err){
          sendJsonResponse(res, 400, err);
        } else {
          doAddReview(req, res, location);
        }
       });
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid required"
    });
  }
};

module.exports.reviewsReadOne = function(req, res){
  if(req.params && req.params.locationid && req.params.reviewid){
    Loc
      .findById(req.params.locationid)
      .select('name reviews')
      .exec(function(err, location){
        var response, review;
        if(!location){
          sendJsonResponse(res, 404, {
            "message": "locationid not found"});
          return;
        } else if(err){
          sendJsonResponse(res, 404, err);
          return;
        }
        if(location.reviews && location.reviews.length > 0){
          review = location.reviews.id(req.params.reviewid);
          if(!review){
            sendJsonResponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            response = {
              location: {
                name: location.name,
                id: req.params.locationid
              },
              review: review
            };
            sendJsonResponse(res, 200, response);
          }
        } else {
            sendJsonResponse(res, 404, {
              "message": "No reviews found"
            });
          }
    });
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
  }
};

module.exports.reviewsUpdateOne = function(req, res){
  // sendJsonResponse(res, 200, {"status": "success"});
  var locationid = req.params.locationid,
      reviewid    = req.params.reviewid;
  if(!locationid || !reviewid){
    sendJsonResponse(res, 404, {
      "message": "not found, locationid and reviewid r both required"
    });
    return;
  }
  Loc
     .findById(locationid)
     .select('reviews')
     .exec(function(err, location){
      var thisReview;
      if(!location){
        sendJsonResponse(res, 404, {
          "message": "locationid not found"
        });
        return;
      } else if(err){
        sendJsonResponse(res, 400, err);
        return;
      }
      if(location.reviews && location.reviews.length > 0){
        thisReview = location.reviews.id(reviewid);
        if(!thisReview){
          sendJsonResponse(res, 404, {
            "message": "reviewid not found"
          });
        } else {
          thisReview.author = req.body.author;
          thisReview.rating = req.body.rating;
          thisReview.reviewText = req.body.reviewText;
          location.save(function(err, location){
            if(err){
              sendJsonResponse(res, 404, err);
            } else {
              updateAverageRating(location._id);
              sendJsonResponse(res, 200, thisReview);
            }
          });
        }
      } else {
        sendJsonResponse(res, 404, {
          "message": "No review to update"
        });
      }
     });
};

module.exports.reviewsDeleteOne = function(req, res){
  // sendJsonResponse(res, 200, {"status": "success"});
  var locationid  = req.params.locationid,
      reviewid    = req.params.reviewid;
  if(!locationid || !reviewid){
    sendJsonResponse(res, 404, {
      "message": "not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
     .findById(locationid)
     .select('reviews')
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
      if(location.reviews && location.reviews.length > 0){
        if(!location.reviews.id(reviewid)){
          sendJsonResponse(res, 404, {
            "message": "reviewid not found"
          });
        } else{
          location.reviews.id(reviewid).remove();
          location.save(function(err){
          if(err){
            sendJsonResponse(res, 404, err);
          } else {
            updateAverageRating(location._id);
            sendJsonResponse(res, 204, null);
          }
        });
        }
      } else {
        sendJsonResponse(res, 404, {
          "message": "no review to remove"
        });
      }
     });
};