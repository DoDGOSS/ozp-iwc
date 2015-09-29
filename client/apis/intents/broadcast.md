##API Action: broadcast(nodeKey,nodeValue)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
* `nodeValue`: **Object** - the settings to store the node.
* `nodeValue.entity`: **Object** - the registration value to store in the node.
    * `nodeValue.entity.label`: **String** - a title/label to distinguish this application.
    * `nodeValue.entity.icon`: **String** - a URL path to an icon to distinguish this application. 
* `nodeValue.contentType`: **String** - For a registration for the intents api **this must be an intent handler content
type**. Currently there is only 1 version of the intent handler content type: 
    * "application/vnd.ozp-iwc-intent-handler-v1+json"

 
#####Applies to only the Intents API
###Broadcast an intent to be Handled by all IWC Intent Registration

When a widget wants to offload operations to other widgets on the bus, intent invocations are used. Much like
Android intents, a payload is not a requirement to send with the intent but is an added benefit. Intents can be used
for notifications (broadcast to all widgets on the bus), triggering some background operation (shutdown utilities),
offloading common tasks (visualizing data, compiling output files, converting documents), and much more.

       
To invoke an intent onto all handlers, the `broadcast` action is used:
```
var intentsApi = client.intents();
var payload = {
    "Hello": "World!"
};

intentsApi.broadcast("/application/view/json",{ entity: payload}).then(function(res){
    // resolves when the intent API receives the request.
});
```

***

###What if there are no handlers?
If there are no handlers open for the desired intent invocation, the invoke promise will reject with a response of 
"noResource". At current state of the platform, launching a registered application to handle an intent invocation has
not been implemented. 

It is planned to replace the promise rejection with giving the user a choice of registered applications to launch to 
handle the desired invocation.