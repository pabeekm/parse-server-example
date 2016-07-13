// Android push test
Parse.Cloud.define('pushChannelTest', function(request, response) {

  // request has 2 parameters: params passed by the client and the authorized user
  var params = request.params;
  var user = request.user;
  var message = params.message;


  // use to custom tweak whatever payload you wish to send
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("deviceType", "android");

  var payload = { "alert": message };

  // Note that useMasterKey is necessary for Push notifications to succeed.
  Parse.Push.send({
  where: pushQuery,      // for sending to a specific channel
  data: {
    alert: 'Test',
    title: 'Hello, world',
    badge: 1,
    sound: 'default'
  }
  }, { success: function() {
     console.log("#### PUSH OK");
  }, error: function(error) {
     console.log("#### PUSH ERROR" + error.message);
  }, useMasterKey: true});

  response.success('success');
});
