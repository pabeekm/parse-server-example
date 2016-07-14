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
