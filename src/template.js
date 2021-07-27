const log = require('logToConsole');
const copyFromWindow = require('copyFromWindow');
const callInWindow = require('callInWindow');
const injectScript = require('injectScript');
const sendPixel = require('sendPixel');
const encodeUriComponent = require('encodeUriComponent');
const makeString = require('makeString');

// add queryParams to url for pushstat
function getUrlWithParams(url, parameters) {
  var urlWithParams = url + '?';
  var isFirst = true;
  for (var key in parameters) {
      var value = parameters[key] === null ? "" : parameters[key];
      urlWithParams += (isFirst ? "" : "&") + key + "=" + encodeUriComponent(value);
      isFirst = false;
  }
  return urlWithParams; 
}

switch (data.eventType) {
    
  // Init loads the helper script for accessing storage
  case 'init': {
    log('Event Type: init');
    injectScript('https://customer.cludo.local/assets/2557/gtm/res/sessionInjector.js', data.gtmOnSuccess, data.gtmOnFailure);
    break;
  }
    
  // Log should be used to send user traits to MyCludo
  case 'log': {
    log('Event Type: log');
    let sessionId = copyFromWindow('cludoSession.sessionId');
    
    if (sessionId && data.logParams[0] && data.logParams[0].key && data.logParams[0].value) {
      let tagId = makeString(data.gtmTagId);
      let eventId = makeString(data.gtmEventId);
      let logObject = {
        'sid': makeString(sessionId),
        'gtmEventId': eventId,
        'gtmTagId': tagId,
        'gtmEventType': data.eventType,   // should always be 'log' unless we start sending other event types
        'dn': data.logParams[0].key,
        'dv': data.logParams[0].value
      };

      let urlBase = (data.customerId >= 10000000) ? 'https://api-us1.cludo.com/api/v3/' : 'https://api.cludo.com/api/v3/';
      let url = urlBase + data.customerId + '/' + data.engineId + '/search/pushStat/gtmlog/';
      let urlWithParams = getUrlWithParams(url, logObject);

      sendPixel(urlWithParams, data.gtmOnSuccess, data.gtmOnFailure);
    } else if (!sessionId) {
      log('The Cludo Tag needs to be initialized before logs can be stored.');
      data.gtmOnFailure();
    } else {
      log('Missing data required to log. Does your log key/value pair exist?');
      data.gtmOnFailure();
    }
    break;
  }
    
  // Trait is used to store user traits to storage where CludoJS can find them 
  case 'trait': {
    log('Event Type: trait');
    if (!copyFromWindow('cludoSession.storeUserTrait')) {
      log('The Cludo Tag needs to be initialized before traits can be stored');
      data.gtmOnFailure();
    }
    
    if (data.logParams[0] && data.logParams[0].key && data.logParams[0].value) {
      let userTraitData = {
        'key': data.logParams[0].key,
        'value': data.logParams[0].value
      };
      callInWindow('cludoSession.storeUserTrait', userTraitData);
      data.gtmOnSuccess();
    } else {
      log('Missing data required to log. Does your log key/value pair exist?');
      data.gtmOnFailure();
    }

    break;
  }
    
}