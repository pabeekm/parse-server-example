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
  var eventId = params.eventId;
  
  if (neutralizeEventIfExpired(eventId)) {
    return;
  }
  
  // Defining the start point of the distance query
  var start = params.start;
  var lon = parseFloat(start.substring(start.indexOf(",") + 1));
  var lat = parseFloat(start.substring(0, start.indexOf(",")));
  var startPoint = new Parse.GeoPoint(lat, lon);

  // get the event of the push
  var Event = Parse.Object.extend("Event");
  var eventQuery = new Parse.Query(Event);
  
  var alertedQuery = new Parse.Query(Event);
  
  // Query constraints
  var userQuery = new Parse.Query(Parse.User);
  userQuery.withinMiles("geoPoint", startPoint, parseInt(distance));


  eventQuery.get( eventId, {
    success: function(object) {
      userQuery.notContainedIn("objectId", object.get("alertedUsers"));
      doPushQuery();
    },
    error: function(error){
      console.log("Error: " + error.code + " " + error.message);
    }
    });
  
  function doPushQuery () {
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
  
  
  // Save the set of alerted users in the event
  eventQuery.get( eventId, {
    success: function(object) {
      userQuery.find({
        success: function (result) {
          for (i = 0; i < result.length; i++)
            object.add("alertedUsers", (result[i]).id);
            object.save();
        },
        error: function (error) {
          alert("Error: " + error.code + " " + error.message);
        }
      }, {useMasterKey: true});
    },
    error: function(error){
      console.log("Error: " + error.code + " " + error.message);
    }
    });
  }
  response.success('success');
});

Parse.Cloud.define('spamAllFriendsInRange', function(request, response){
  var params = request.params;
  var user = request.user;
  var message = params.message;
  var title = params.title;
  var distance = params.distance;
  var eventId = params.eventId;
  
  if (neutralizeEventIfExpired(eventId)) {
    return;
  }
  
  // Defining the start point of the distance query
  var start = params.start;
  var lon = parseFloat(start.substring(start.indexOf(",") + 1));
  var lat = parseFloat(start.substring(0, start.indexOf(",")));
  var startPoint = new Parse.GeoPoint(lat, lon);

  // get the event of the push
  var Event = Parse.Object.extend("Event");
  var eventQuery = new Parse.Query(Event);
  
  var alertedQuery = new Parse.Query(Event);
  
  // Query constraints
  var userQuery = new Parse.Query(Parse.User);
  userQuery.containedIn("FBid", request.user.get("friendsIDs"));
  userQuery.withinMiles("geoPoint", startPoint, parseInt(distance));


  eventQuery.get( eventId, {
    success: function(object) {
      userQuery.notContainedIn("objectId", object.get("alertedUsers"));
      doPushQuery();
    },
    error: function(error){
      console.log("Error: " + error.code + " " + error.message);
    }
    });
  
  function doPushQuery () {
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
  
  
  // Save the set of alerted users in the event
  eventQuery.get( eventId, {
    success: function(object) {
      userQuery.find({
        success: function (result) {
          for (i = 0; i < result.length; i++)
            object.add("alertedUsers", (result[i]).id);
            object.save();
        },
        error: function (error) {
          alert("Error: " + error.code + " " + error.message);
        }
      }, {useMasterKey: true});
    },
    error: function(error){
      console.log("Error: " + error.code + " " + error.message);
    }
    });
  }
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

Parse.Cloud.define("getServerTime", function(request, response) {
    var params = request.params;
    var user = request.user;
    user.set("currTime", Date.now());
    response.success("success");
});

Parse.Cloud.define("getEndTime", function(request, response) {

  var params = request.params;
  var duration = calculateDuration(params.duration);
  var currTime = Date.now();
  var endTime = calculateEnd(currTime, duration);
  var Event = Parse.Object.extend("Event");
  var eventQuery = new Parse.Query(Event);
  eventQuery.equalTo("FBid", request.user.get("FBid"));
  eventQuery.first({
    success: function(object) {
      console.log("Successfully retrieved " + object.toString());
      object.set("endTime", endTime);
      object.set("duration", duration);
      object.save();
    },
    error: function(error){
      console.log("Error: " + error.code + " " + error.message);
    }
  });
  response.success(endTime + "");
});

Parse.Cloud.define("setTimeLeft", function(request, response){
  var params = request.params;
});

Parse.Cloud.define("neutralize", function(request, response){
  var params = request.params;
  var eventId = params.eventId;
  neutralizeEventIfExpired(eventId);
  response.success("success");
});

function calculateDuration(duration){
  var num = parseInt(duration.substring(0, duration.indexOf(" ")));
  if(duration.charAt(duration.indexOf(" ") + 1) == "M"){
    return num * 60000;
  }
  else{
    return num * 3600000;
  }
}


function calculateEnd(currTime, duration){
  return currTime + duration;
}

function millisToMin(endTime, currTime){
  var timeLeft = endTime - currTime;
  return timeLeft / 60000;
}

function neutralizeEventIfExpired(eventId) {
  var Event = Parse.Object.extend("Event");
  var eventQuery = new Parse.Query(Event);
  eventQuery.get( eventId, {
	  success: function(object) {
	    if (object.get("endTime") < Date.now()) {
	      object.set("Location", "None");
	      object.set("Message", "None");
	      object.set("Disturb", "Neutral");
	      object.set("alertedUsers", []);
	      object.save();
	      return true;
	    }
	    return false;
	  },
	  error: function(error){
	    console.log("Error: " + error.code + " " + error.message);
	  }
	});
}
