// Push to all users
Parse.Cloud.define('spamAllUsers', function(request, response) {

  var params = request.params;
  var user = request.user;
  var message = params.message;
  var title = params.title;

  // Query constraints
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("deviceType", "android");
  Parse.Push.send({
  where: pushQuery,     
  data: {
    alert: message,
    title: title,
    badge: 1,
    sound: 'default'
  },
  }, { success: function() {
     console.log("#### PUSH OK");
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});

// Push to all users in range
Parse.Cloud.define('spamAllUsersInRange', function(request, response) {
  
  var params = request.params;
  var user = request.user;
  var message = params.message;
  var title = params.title;
  var distance = params.distance;
  
  // Defining the start point of the distance query
  var start = params.start;
  var lon = parseFloat(start.substring(start.indexOf(",") + 1));
  var lat = parseFloat(start.substring(0, start.indexOf(",")));
  var startPoint = new Parse.GeoPoint(lat, lon);

  // Query constraints
  var userQuery = new Parse.Query(Parse.User);
  userQuery.withinMiles("geoPoint", startPoint, parseInt(distance));
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.matchesQuery("user", userQuery);
  Parse.Push.send({
  where: pushQuery,     
  data: {
    alert: message,
    title: title,
    badge: 1,
    sound: 'default'
  },
  }, { success: function() {
     console.log("#### PUSH OK");
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});

// Convert a string "lat, long", into a GeoPoint object and assign it to the user.
Parse.Cloud.define('assignGeoPoint', function(request, response) {
  var params = request.params;
  var user = request.user;
  
  var latlongString = params.latlongString;
  var lon = parseFloat(latlongString.substring(latlongString.indexOf(",") + 1));
  var lat = parseFloat(latlongString.substring(0, latlongString.indexOf(",")));
  var point = new Parse.GeoPoint(lat, lon);
  
  user.set("geoPoint", point);
  user.save(null, {useMasterKey:true});
  response.success('success');
});
