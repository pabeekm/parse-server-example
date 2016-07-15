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
  
  // Defining the start point of the distance query
  var start = params.start;
  var lat = parseFloat(start.substring(start.indexOf(",") + 1));
  var lon = parseFloat(start.substring(0, start.indexOf(",")));
  var startPoint = new Parse.GeoPoint(lat, lon);

  // Query constraints
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.withinMiles("location", startPoint, 1);

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

