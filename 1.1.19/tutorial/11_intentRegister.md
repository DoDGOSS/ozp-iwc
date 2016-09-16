---
layout: old_tutorial
title: Registering an Intent Handler
category: intents
tag: 1.1.19
---

# Registering an Intent Handler on the Intents Api
Registering an intent handler means to share some functionality of an application with other applications.

Before registering a handler, refer to the following frequently asked questions:

### What is the /type/sub-type of my expected data?
The /type/sub-type of an intent handler specifies the required data schema of your intent. When defining an
intent handler, if public utilization of your application is desired, utilize a community-driven /type/sub-type path.

If your intent use is private to your applications, utilize `/application/vnd.{uniqueName}`, where
`{uniqueName}` is some dot-separated unique name for your application (ex. `com.ozp.intentExample`).

Documentation on /type/sub-type paths are developed based on community support. As the IWC is in its infant years of
community use, if you can't find documentation on your desired data type, it is very well possible you are the first
to use it. Open an [issue](http://www.github.com/ozoneplatform/ozp-iwc/issues) with the data type/subtype,
proposed schema, and a description. The IWC [Community Intent Book](about:blank) is a community driven
set of data type documents used as a centralized resource for developers.

### What is action my function handles?
The action is the verb of the handler, it should be a single word describing what the intent handler does (print, graph,
map, ect). As stated above, check the [Community Intent Book](about:blank) for community-driven formatting and actions.

### What if the /type/sub-type/action I want to use is already in the Community Intent Book?
**This is ideal!** If your desired /type/sub-type/action exists in the [Community Intent Book](about:blank), this does not mean your
application isn't desired. This means the functionality you would like to produce has been developed by others, if
their functionality doesn't meet your needs or you would like your own version as long as you maintain the defined
data schema developers and users can use your application interchangeably.

**Don't agree with a defined format?** If you have supporting reason to modify the schema open an
[issue](http://www.github.com/ozoneplatform/ozp-iwc/issues). If there is enough community support we will consider
the modification. This will push the new data type to a versioned name (ex. `/json/location` would become `/json/location;version=2`).

***

## Accessing Intents Api
To register a function, a reference to the **Intents Api** from the client is needed. This follows the same format as
the **Data Api**, the `intents` reference can come from the same client object as `data`.

``` js
var client = new ozpIwc.Client({peerUrl: "http://ozoneplatform.github.io/ozp-iwc"});
var intents = client.intents();
```
***

## Register: sharing a function

####Parameters

| parameter | type   | description                                                                                                                                                            |
|-----------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resource  | String | A string path-name used as a key for the value. As explained in the [Intents Explained](10_intentInit.html) tutorial, intent registrations use a `/{Type}/{Sub-type/{Action}/{Handler}` format. If the `/{Handler}` portion is not provided the IWC will auto-generate a handler Id.                                |
| options   | Object | (Optional) An object of options for the action. More options are covered in later tutorials, for now we will focus on the`config.entity` option, which is metadata for the intent. |
| callback  | Function| The function to call with the type/sub-type matching data.

#####Options.entity

| parameter | type   | description                                          |
|-----------|--------|------------------------------------------------------|
| icon  | String | A URL path to an Icon to use as metadata for the intent. |
| label| Object | A Title unique to the registered application.             |

####Returns
A promise that resolves with a response object upon handling of the request:

| property | type   | description                                                                                 |
|----------|--------|---------------------------------------------------------------------------------------------|
| ver      | Number | The version of the response. Not applicable to set requests, pertains to watch requests.    |
| src      | String | The address of of the response sender. "intents.api" is the internal address for the Intents Api. |
| msgId    | String | The ID of the message being received. The "P" denotes the message for internal purposes.    |
| time     | Number | Epoch time of the response **being created and sent**.                                      |
| response | String | The status of the message. "ok" means the request was successfully handled.                 |
| replyTo  | String | The ID of the request this response pertains to.                                            |
| dst      | String | The address of the recipient of this message.                                               |
| entity   | Object |  A response payload to the registration request.                                            |
| entity.resource| String|  The resource name assigned to the registration, if the handlerId was given in the path this will be the user specified resource name. If not a handler Id is generated.|


####Callback
The callback receives 2 parameters:
 1. `reply`: contains various information about an intent. For the introductory purposes of intent registrations, only
 `reply.entity` is covered here, other properties will be covered for more advanced intents in a later tutorial.
 2. `done`: A function to call to stop handling intent requests. Useful for conditionally stopping intent handling.

**The return value of the callback is returned to the intent invoker.** This means when developing an application, if
there is some complex computation an application can do that other applications may also need (complex sorting for example),
returning the value of the intent handling means other applications can leverage the functionality.

| property | type   | description                                                                                                                      |
|----------|--------|----------------------------------------------------------------------------------------------------------------------------------|
| entity   | *      | The payload of the intent invocation to be handled. Should match the schema for the /{Type}/{Sub-type} of the registered function.|


<p data-height="245" data-theme-id="0" data-slug-hash="xZbdLv" data-default-tab="js" data-user="Kevin-K" class='codepen'>

***

## Invoking: calling an intent function
Invoking an intent function across the IWC is done with the `invoke` action. It is covered in its own [tutorial](12_intentInvoking.html).
For purpose of seeing the above code snippet work, click the button on the example below.

<p data-height="245" data-theme-id="0" data-slug-hash="LGEyQV" data-default-tab="result" data-user="Kevin-K" class='codepen'>
