extensionId = "nmmhkkegccagdldgiimedpiccmgmieda"
let port = null
const discount_tire_endpoint = "https://data.discounttire.com/webapi/discounttire.graph";
const americas_tire_endpoint = "https://data.americastire.com/webapi/americastire.graph";
global_background_message_log = []
var generateAuthHash; // Declare it globally

async function connect_to_background() {
    const extensionId = "nmmhkkegccagdldgiimedpiccmgmieda";
    if (!port) {
        port = chrome.runtime.connect(extensionId, { name: "knockknock" });
        port.onDisconnect.addListener(() => {
            console.error('Background disconnected');
            port = null; // Reset port on disconnect
        });

        port.onMessage.addListener((message) => {
            console.log("Message received from background:", message);
            parse_msg2(message).then(response => {
                console.log("Response:", response);
                port.postMessage(response);
            }).catch(error => {
                console.error('Error handling message:', error);
            });
        });
    }
}


async function send_message(msg) {
    if (port === null) {
        await connect_to_background();
    }
    if (!msg.hasOwnProperty('ready')) {
        msg.ready = true;
    }
    console.log("Sending message to background", msg);
    try {
        port.postMessage(msg);
    } catch (error) {
        console.error('Error sending message:', error);
        port = null; // Ensure that port is null if it's disconnected
        await connect_to_background(); // Try reconnecting
        if (port) {
            port.postMessage(msg); // Retry sending the message
        } else {
            console.error('Failed to reconnect to the background.');
        }
    }
}
function waitForJquery(callback) {
    window.addEventListener('load', function () {
        console.log("waiting for jquery");
        callback();
      })
    if (typeof jQuery == 'undefined') {
        console.log("waiting for jquery");
        window.setTimeout(waitForJquery, 1000);
        
    } else {
        jQuery(document).ready(function () {
            callback();
        });
    }
}


async function ClearAllCookies() {
    // https://github.com/jamesdbloom/delete-all-cookies/blob/master/content.js
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split("=");
        var domainParts = document.domain.match(/[a-zA-Z0-9]+\.?/g);
        for (var j = 0; j < domainParts.length - 1; j++) {
            var domain = (j > 0 ? "." : "" ) + document.domain.match(/[a-zA-Z0-9]+\.?/g).splice(j).join("");
            document.cookie = cookie[0] + "=;expires=Thu, 21 Sep 1979 00:00:01 UTC;domain=" + domain + ";";
        }
    }
    return { status: "Cookies Cleared" };
    
}


async function ScrollDown(y, loopTime) {
    for (let i = 0; i < loopTime; i++) {
        console.log(`Iteration is #${i}`);
        // scroll to the bottom to load more data
        const scrollingElement = (document.scrollingElement || document.body);
        scrollingElement.scrollTop = scrollingElement.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
        window.scrollBy({
            top: y,
            left: 0,
            behavior: 'smooth'
          });
        window.scrollBy(0, y)
        await sleep(1000);
    }

}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}






async function wait_for_element (element_by, identifier, timeout_ms= 4000 ) {
    const sleep_interval = 300;
    var sleep_elapsed = 0;
    var element = element_by(identifier); 

    while (!element) {
        console.log('waiting for element', element_by, identifier);        
        await sleep(sleep_interval);
        if (sleep_elapsed > timeout_ms) {
            throw "Timed out waiting for element";
        }
        sleep_elapsed += sleep_interval;
        element = await element_by(identifier);
    }
    return await element
}


async function WhereAmI() {
    return {location: location.href, page_tile: document.title}

}


async function cors_fetch (inventory_url, body, method='POST') {
    if (!body) { method = method || 'GET' }
    // console.log('cors_fetch', inventory_url, body, method);
    if (method == 'POST') {
    var rawResponse = await fetch(inventory_url, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "text/plain",
            "sec-ch-ua": "\"Chromium\";v=\"105\", \"Google Chrome\";v=\"105\", \"Not;A=Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify(body),
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
    }
    else if (method == 'GET') {
        var rawResponse = await fetch(inventory_url, {
            "referrerPolicy": "strict-origin-when-cross-origin",
            "method": method,
            "body": null,
            "mode": "cors",
            "credentials": "include"
        });
    }
    else if (method == 'GOODYEAR') {
        var rawResponse = await fetch(inventory_url, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-newrelic-id": "UwQOUVZQGwEHVFRRAgIP",
                "x-requested-with": "XMLHttpRequest"
              },
              "referrer": document.location.href,
              "referrerPolicy": "strict-origin-when-cross-origin",
              "body": body,
              "method": "POST",
              "mode": "cors",
              "credentials": "include"
        });
    }
    else if (method === 'MAVIS') {
        var rawResponse = await fetch(inventory_url, {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.5",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "ocp-apim-subscription-key": "38b1ddf34e6d45da8fcdd6a15a3741dc",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Brave\";v=\"120\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1"
              },
              "referrer": document.location.href,
              "referrerPolicy": "strict-origin-when-cross-origin",
              "body": body,
              "method": "POST",
              "mode": "cors",
              "credentials": "omit"
        });
    }
    else if (method == 'WALMART') {
    var rawResponse = await fetch(inventory_url, {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "device_profile_ref_id": "VImmG9C45Tzn1x8FkD63kCwipjZAlEyPMX8p",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "traceparent": "00-acdce968b5eeff4119a5be76ce24d6f8-d55c283c52b6c2e7-00",
                "wm_mp": "true",
                "wm_page_url": document.location.href,
                "wm_qos.correlation_id": "6P_o4RNF47yNvhp2GkaOHtV4gOHVvZgmgifA",
                "x-apollo-operation-name": "Search",
                "x-enable-server-timing": "1",
                "x-latency-trace": "1",
                "x-o-bu": "WALMART-US",
                "x-o-ccm": "server",
                "x-o-correlation-id": "6P_o4RNF47yNvhp2GkaOHtV4gOHVvZgmgifA",
                "x-o-gql-query": "query Search",
                "x-o-mart": "B2C",
                "x-o-platform": "rweb",
                "x-o-platform-version": "main-1.25.0-b626c5",
                "x-o-segment": "oaoh"
            },
            "referrer": document.location.href,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
            });
            var content = await rawResponse.json();
            return await content;

    }
    else if (method == 'WALMART3') {
        var rawResponse = await fetch(inventory_url, {
                "headers": {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "device_profile_ref_id": "VImmG9C45Tzn1x8FkD63kCwipjZAlEyPMX8p",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "traceparent": "00-acdce968b5eeff4119a5be76ce24d6f8-d55c283c52b6c2e7-00",
                    "wm_mp": "true",
                    "wm_page_url": document.location.href,
                    "wm_qos.correlation_id": "6P_o4RNF47yNvhp2GkaOHtV4gOHVvZgmgifA",
                    "x-apollo-operation-name": "storeFinderNearbyNodesQuery",
                    "x-enable-server-timing": "1",
                    "x-latency-trace": "1",
                    "x-o-bu": "WALMART-US",
                    "x-o-ccm": "server",
                    "x-o-correlation-id": "6P_o4RNF47yNvhp2GkaOHtV4gOHVvZgmgifA",
                    "x-o-gql-query": "query storeFinderNearbyNodesQuery",
                    "x-o-mart": "B2C",
                    "x-o-platform": "rweb",
                    "x-o-platform-version": "main-1.25.0-b626c5",
                    "x-o-segment": "oaoh"
                },
                "referrer": document.location.href,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
                });
                var content = await rawResponse.json();
                return await content;
    
        }
    else if (method == 'WALMART2') {
    var rawResponse = await fetch(inventory_url, {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "device_profile_ref_id": "zBGVZaUKNGNouKKQzTPZ9muGYATT40414VIs",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "traceparent": "00-5f8e7d664e8a7313bb1f9dc685cbf5a9-16d1af78b72dde81-00",
                "wm_mp": "true",
                "wm_page_url": document.location.href,
                "wm_qos.correlation_id": "TNfRuJh4vI4Eh_vb3m_MLufLJxRXrUKv5YrA",
                "x-apollo-operation-name": "setPickup",
                "x-enable-server-timing": "1",
                "x-latency-trace": "1",
                "x-o-bu": "WALMART-US",
                "x-o-ccm": "server",
                "x-o-correlation-id": "TNfRuJh4vI4Eh_vb3m_MLufLJxRXrUKv5YrA",
                "x-o-gql-query": "mutation setPickup",
                "x-o-mart": "B2C",
                "x-o-platform": "rweb",
                "x-o-platform-version": "main-1.25.0-b626c5",
                "x-o-segment": "oaoh"
            },
            "referrer": document.location.href,
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
            });
            
        }
    else if (method == 'COSTCO') {
        var rawResponse = await fetch("https://tires.costco.com/SearchFilters/GetCustomFitmentAspectListAsJson?lang=en-us", {
            "headers": {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/json",
              "pragma": "no-cache",
              "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://tires.costco.com/Home",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": JSON.stringify(body),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });
          var content = await rawResponse.json();
          await content;
          return JSON.parse(content);
        }
    try {
        var content = await rawResponse.text();
        content = JSON.parse(content);

    }
    catch (e) {
        console.log('non fatal in cors_fetch');
        return await content
    }
    return await content;
}

function convert_nodes_to_array(nodes) {
    var nodes_array = []
    for (var node of nodes) {
        nodes_array.push(node.value)
    }
    return nodes_array
}


function serialize (obj, prefix) {
    var str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
        str.push((v !== null && typeof v === "object") ?
          serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }



async function getPageValue(code) {
    const dataname = (new Date()).getTime(); 
    const content = `(()=>{document.body.setAttribute('data-${dataname}', JSON.stringify(${code}));})();`;
    const script = document.createElement('script');
    
    script.textContent = content;
    document.body.appendChild(script);
    script.remove();

    const result = JSON.parse(document.body.getAttribute(`data-${dataname}`));
    document.body.removeAttribute(`data-${dataname}`);
   
    return result;
}


async function exec_page_script(code) {
    // https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script
    var actualCode = code
    
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
    await sleep(1) 
    return true  
}


//---------------------------------------------------------------------
// HELPERS
//---------------------------------------------------------------------
function GetCurTimeStr() {
    dt = new Date();
    return dt.toLocaleTimeString() + '.' + dt.getMilliseconds()
}


//---------------------------------------------------------------------
// BELLETIRE block
//---------------------------------------------------------------------


 (function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.X2JS = factory();
    }
}(this, function () {
   return function (config) {
       'use strict';
           
       var VERSION = "1.2.0";
       
       config = config || {};
       initConfigDefaults();
       initRequiredPolyfills();
       
       function initConfigDefaults() {
           if(config.escapeMode === undefined) {
               config.escapeMode = true;
           }
           
           config.attributePrefix = config.attributePrefix || "_";
           config.arrayAccessForm = config.arrayAccessForm || "none";
           config.emptyNodeForm = config.emptyNodeForm || "text";		
           
           if(config.enableToStringFunc === undefined) {
               config.enableToStringFunc = true; 
           }
           config.arrayAccessFormPaths = config.arrayAccessFormPaths || []; 
           if(config.skipEmptyTextNodesForObj === undefined) {
               config.skipEmptyTextNodesForObj = true;
           }
           if(config.stripWhitespaces === undefined) {
               config.stripWhitespaces = true;
           }
           config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];
   
           if(config.useDoubleQuotes === undefined) {
               config.useDoubleQuotes = false;
           }
           
           config.xmlElementsFilter = config.xmlElementsFilter || [];
           config.jsonPropertiesFilter = config.jsonPropertiesFilter || [];
           
           if(config.keepCData === undefined) {
               config.keepCData = false;
           }
       }
   
       var DOMNodeTypes = {
           ELEMENT_NODE 	   : 1,
           TEXT_NODE    	   : 3,
           CDATA_SECTION_NODE : 4,
           COMMENT_NODE	   : 8,
           DOCUMENT_NODE 	   : 9
       };
       
       function initRequiredPolyfills() {		
       }
       
       function getNodeLocalName( node ) {
           var nodeLocalName = node.localName;			
           if(nodeLocalName == null) // Yeah, this is IE!! 
               nodeLocalName = node.baseName;
           if(nodeLocalName == null || nodeLocalName=="") // =="" is IE too
               nodeLocalName = node.nodeName;
           return nodeLocalName;
       }
       
       function getNodePrefix(node) {
           return node.prefix;
       }
           
       function escapeXmlChars(str) {
           if(typeof(str) == "string")
               return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
           else
               return str;
       }
   
       function unescapeXmlChars(str) {
           return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
       }
       
       function checkInStdFiltersArrayForm(stdFiltersArrayForm, obj, name, path) {
           var idx = 0;
           for(; idx < stdFiltersArrayForm.length; idx++) {
               var filterPath = stdFiltersArrayForm[idx];
               if( typeof filterPath === "string" ) {
                   if(filterPath == path)
                       break;
               }
               else
               if( filterPath instanceof RegExp) {
                   if(filterPath.test(path))
                       break;
               }				
               else
               if( typeof filterPath === "function") {
                   if(filterPath(obj, name, path))
                       break;
               }
           }
           return idx!=stdFiltersArrayForm.length;
       }
       
       function toArrayAccessForm(obj, childName, path) {
           switch(config.arrayAccessForm) {
               case "property":
                   if(!(obj[childName] instanceof Array))
                       obj[childName+"_asArray"] = [obj[childName]];
                   else
                       obj[childName+"_asArray"] = obj[childName];
                   break;
               /*case "none":
                   break;*/
           }
           
           if(!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
               if(checkInStdFiltersArrayForm(config.arrayAccessFormPaths, obj, childName, path)) {
                   obj[childName] = [obj[childName]];
               }			
           }
       }
       
       function fromXmlDateTime(prop) {
           // Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
           // Improved to support full spec and optional parts
           var bits = prop.split(/[-T:+Z]/g);
           
           var d = new Date(bits[0], bits[1]-1, bits[2]);			
           var secondBits = bits[5].split("\.");
           d.setHours(bits[3], bits[4], secondBits[0]);
           if(secondBits.length>1)
               d.setMilliseconds(secondBits[1]);
   
           // Get supplied time zone offset in minutes
           if(bits[6] && bits[7]) {
               var offsetMinutes = bits[6] * 60 + Number(bits[7]);
               var sign = /\d\d-\d\d:\d\d$/.test(prop)? '-' : '+';
   
               // Apply the sign
               offsetMinutes = 0 + (sign == '-'? -1 * offsetMinutes : offsetMinutes);
   
               // Apply offset and local timezone
               d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset())
           }
           else
               if(prop.indexOf("Z", prop.length - 1) !== -1) {
                   d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));					
               }
   
           // d is now a local time equivalent to the supplied time
           return d;
       }
       
       function checkFromXmlDateTimePaths(value, childName, fullPath) {
           if(config.datetimeAccessFormPaths.length > 0) {
               var path = fullPath.split("\.#")[0];
               if(checkInStdFiltersArrayForm(config.datetimeAccessFormPaths, value, childName, path)) {
                   return fromXmlDateTime(value);
               }
               else
                   return value;			
           }
           else
               return value;
       }
       
       function checkXmlElementsFilter(obj, childType, childName, childPath) {
           if( childType == DOMNodeTypes.ELEMENT_NODE && config.xmlElementsFilter.length > 0) {
               return checkInStdFiltersArrayForm(config.xmlElementsFilter, obj, childName, childPath);	
           }
           else
               return true;
       }	
   
       function parseDOMChildren( node, path ) {
           if(node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
               var result = new Object;
               var nodeChildren = node.childNodes;
               // Alternative for firstElementChild which is not supported in some environments
               for(var cidx=0; cidx <nodeChildren.length; cidx++) {
                   var child = nodeChildren.item(cidx);
                   if(child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
                       var childName = getNodeLocalName(child);
                       result[childName] = parseDOMChildren(child, childName);
                   }
               }
               return result;
           }
           else
           if(node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
               var result = new Object;
               result.__cnt=0;
               
               var nodeChildren = node.childNodes;
               
               // Children nodes
               for(var cidx=0; cidx <nodeChildren.length; cidx++) {
                   var child = nodeChildren.item(cidx); // nodeChildren[cidx];
                   var childName = getNodeLocalName(child);
                   
                   if(child.nodeType!= DOMNodeTypes.COMMENT_NODE) {
                       var childPath = path+"."+childName;
                       if (checkXmlElementsFilter(result,child.nodeType,childName,childPath)) {
                           result.__cnt++;
                           if(result[childName] == null) {
                               result[childName] = parseDOMChildren(child, childPath);
                               toArrayAccessForm(result, childName, childPath);					
                           }
                           else {
                               if(result[childName] != null) {
                                   if( !(result[childName] instanceof Array)) {
                                       result[childName] = [result[childName]];
                                       toArrayAccessForm(result, childName, childPath);
                                   }
                               }
                               (result[childName])[result[childName].length] = parseDOMChildren(child, childPath);
                           }
                       }
                   }								
               }
               
               // Attributes
               for(var aidx=0; aidx <node.attributes.length; aidx++) {
                   var attr = node.attributes.item(aidx); // [aidx];
                   result.__cnt++;
                   result[config.attributePrefix+attr.name]=attr.value;
               }
               
               // Node namespace prefix
               var nodePrefix = getNodePrefix(node);
               if(nodePrefix!=null && nodePrefix!="") {
                   result.__cnt++;
                   result.__prefix=nodePrefix;
               }
               
               if(result["#text"]!=null) {				
                   result.__text = result["#text"];
                   if(result.__text instanceof Array) {
                       result.__text = result.__text.join("\n");
                   }
                   //if(config.escapeMode)
                   //	result.__text = unescapeXmlChars(result.__text);
                   if(config.stripWhitespaces)
                       result.__text = result.__text.trim();
                   delete result["#text"];
                   if(config.arrayAccessForm=="property")
                       delete result["#text_asArray"];
                   result.__text = checkFromXmlDateTimePaths(result.__text, childName, path+"."+childName);
               }
               if(result["#cdata-section"]!=null) {
                   result.__cdata = result["#cdata-section"];
                   delete result["#cdata-section"];
                   if(config.arrayAccessForm=="property")
                       delete result["#cdata-section_asArray"];
               }
               
               if( result.__cnt == 0 && config.emptyNodeForm=="text" ) {
                   result = '';
               }
               else
               if( result.__cnt == 1 && result.__text!=null  ) {
                   result = result.__text;
               }
               else
               if( result.__cnt == 1 && result.__cdata!=null && !config.keepCData  ) {
                   result = result.__cdata;
               }			
               else			
               if ( result.__cnt > 1 && result.__text!=null && config.skipEmptyTextNodesForObj) {
                   if( (config.stripWhitespaces && result.__text=="") || (result.__text.trim()=="")) {
                       delete result.__text;
                   }
               }
               delete result.__cnt;			
               
               if( config.enableToStringFunc && (result.__text!=null || result.__cdata!=null )) {
                   result.toString = function() {
                       return (this.__text!=null? this.__text:'')+( this.__cdata!=null ? this.__cdata:'');
                   };
               }
               
               return result;
           }
           else
           if(node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
               return node.nodeValue;
           }	
       }
       
       function startTag(jsonObj, element, attrList, closed) {
           var resultStr = "<"+ ( (jsonObj!=null && jsonObj.__prefix!=null)? (jsonObj.__prefix+":"):"") + element;
           if(attrList!=null) {
               for(var aidx = 0; aidx < attrList.length; aidx++) {
                   var attrName = attrList[aidx];
                   var attrVal = jsonObj[attrName];
                   if(config.escapeMode)
                       attrVal=escapeXmlChars(attrVal);
                   resultStr+=" "+attrName.substr(config.attributePrefix.length)+"=";
                   if(config.useDoubleQuotes)
                       resultStr+='"'+attrVal+'"';
                   else
                       resultStr+="'"+attrVal+"'";
               }
           }
           if(!closed)
               resultStr+=">";
           else
               resultStr+="/>";
           return resultStr;
       }
       
       function endTag(jsonObj,elementName) {
           return "</"+ (jsonObj.__prefix!=null? (jsonObj.__prefix+":"):"")+elementName+">";
       }
       
       function endsWith(str, suffix) {
           return str.indexOf(suffix, str.length - suffix.length) !== -1;
       }
       
       function jsonXmlSpecialElem ( jsonObj, jsonObjField ) {
           if((config.arrayAccessForm=="property" && endsWith(jsonObjField.toString(),("_asArray"))) 
                   || jsonObjField.toString().indexOf(config.attributePrefix)==0 
                   || jsonObjField.toString().indexOf("__")==0
                   || (jsonObj[jsonObjField] instanceof Function) )
               return true;
           else
               return false;
       }
       
       function jsonXmlElemCount ( jsonObj ) {
           var elementsCnt = 0;
           if(jsonObj instanceof Object ) {
               for( var it in jsonObj  ) {
                   if(jsonXmlSpecialElem ( jsonObj, it) )
                       continue;			
                   elementsCnt++;
               }
           }
           return elementsCnt;
       }
       
       function checkJsonObjPropertiesFilter(jsonObj, propertyName, jsonObjPath) {
           return config.jsonPropertiesFilter.length == 0
               || jsonObjPath==""
               || checkInStdFiltersArrayForm(config.jsonPropertiesFilter, jsonObj, propertyName, jsonObjPath);	
       }
       
       function parseJSONAttributes ( jsonObj ) {
           var attrList = [];
           if(jsonObj instanceof Object ) {
               for( var ait in jsonObj  ) {
                   if(ait.toString().indexOf("__")== -1 && ait.toString().indexOf(config.attributePrefix)==0) {
                       attrList.push(ait);
                   }
               }
           }
           return attrList;
       }
       
       function parseJSONTextAttrs ( jsonTxtObj ) {
           var result ="";
           
           if(jsonTxtObj.__cdata!=null) {										
               result+="<![CDATA["+jsonTxtObj.__cdata+"]]>";					
           }
           
           if(jsonTxtObj.__text!=null) {			
               if(config.escapeMode)
                   result+=escapeXmlChars(jsonTxtObj.__text);
               else
                   result+=jsonTxtObj.__text;
           }
           return result;
       }
       
       function parseJSONTextObject ( jsonTxtObj ) {
           var result ="";
   
           if( jsonTxtObj instanceof Object ) {
               result+=parseJSONTextAttrs ( jsonTxtObj );
           }
           else
               if(jsonTxtObj!=null) {
                   if(config.escapeMode)
                       result+=escapeXmlChars(jsonTxtObj);
                   else
                       result+=jsonTxtObj;
               }
           
           return result;
       }
       
       function getJsonPropertyPath(jsonObjPath, jsonPropName) {
           if (jsonObjPath==="") {
               return jsonPropName;
           }
           else
               return jsonObjPath+"."+jsonPropName;
       }
       
       function parseJSONArray ( jsonArrRoot, jsonArrObj, attrList, jsonObjPath ) {
           var result = ""; 
           if(jsonArrRoot.length == 0) {
               result+=startTag(jsonArrRoot, jsonArrObj, attrList, true);
           }
           else {
               for(var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
                   result+=startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
                   result+=parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath,jsonArrObj));
                   result+=endTag(jsonArrRoot[arIdx],jsonArrObj);
               }
           }
           return result;
       }
       
       function parseJSONObject ( jsonObj, jsonObjPath ) {
           var result = "";	
   
           var elementsCnt = jsonXmlElemCount ( jsonObj );
           
           if(elementsCnt > 0) {
               for( var it in jsonObj ) {
                   
                   if(jsonXmlSpecialElem ( jsonObj, it) || (jsonObjPath!="" && !checkJsonObjPropertiesFilter(jsonObj, it, getJsonPropertyPath(jsonObjPath,it))) )
                       continue;			
                   
                   var subObj = jsonObj[it];						
                   
                   var attrList = parseJSONAttributes( subObj )
                   
                   if(subObj == null || subObj == undefined) {
                       result+=startTag(subObj, it, attrList, true);
                   }
                   else
                   if(subObj instanceof Object) {
                       
                       if(subObj instanceof Array) {					
                           result+=parseJSONArray( subObj, it, attrList, jsonObjPath );					
                       }
                       else if(subObj instanceof Date) {
                           result+=startTag(subObj, it, attrList, false);
                           result+=subObj.toISOString();
                           result+=endTag(subObj,it);
                       }
                       else {
                           var subObjElementsCnt = jsonXmlElemCount ( subObj );
                           if(subObjElementsCnt > 0 || subObj.__text!=null || subObj.__cdata!=null) {
                               result+=startTag(subObj, it, attrList, false);
                               result+=parseJSONObject(subObj, getJsonPropertyPath(jsonObjPath,it));
                               result+=endTag(subObj,it);
                           }
                           else {
                               result+=startTag(subObj, it, attrList, true);
                           }
                       }
                   }
                   else {
                       result+=startTag(subObj, it, attrList, false);
                       result+=parseJSONTextObject(subObj);
                       result+=endTag(subObj,it);
                   }
               }
           }
           result+=parseJSONTextObject(jsonObj);
           
           return result;
       }
       
       this.parseXmlString = function(xmlDocStr) {
           var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
           if (xmlDocStr === undefined) {
               return null;
           }
           var xmlDoc;
           if (window.DOMParser) {
               var parser=new window.DOMParser();			
               var parsererrorNS = null;
               // IE9+ now is here
               if(!isIEParser) {
                   try {
                       parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
                   }
                   catch(err) {					
                       parsererrorNS = null;
                   }
               }
               try {
                   xmlDoc = parser.parseFromString( xmlDocStr, "text/xml" );
                   if( parsererrorNS!= null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
                       //throw new Error('Error parsing XML: '+xmlDocStr);
                       xmlDoc = null;
                   }
               }
               catch(err) {
                   xmlDoc = null;
               }
           }
           else {
               // IE :(
               if(xmlDocStr.indexOf("<?")==0) {
                   xmlDocStr = xmlDocStr.substr( xmlDocStr.indexOf("?>") + 2 );
               }
               xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
               xmlDoc.async="false";
               xmlDoc.loadXML(xmlDocStr);
           }
           return xmlDoc;
       };
       
       this.asArray = function(prop) {
           if (prop === undefined || prop == null)
               return [];
           else
           if(prop instanceof Array)
               return prop;
           else
               return [prop];
       };
       
       this.toXmlDateTime = function(dt) {
           if(dt instanceof Date)
               return dt.toISOString();
           else
           if(typeof(dt) === 'number' )
               return new Date(dt).toISOString();
           else	
               return null;
       };
       
       this.asDateTime = function(prop) {
           if(typeof(prop) == "string") {
               return fromXmlDateTime(prop);
           }
           else
               return prop;
       };
   
       this.xml2json = function (xmlDoc) {
           return parseDOMChildren ( xmlDoc );
       };
       
       this.xml_str2json = function (xmlDocStr) {
           var xmlDoc = this.parseXmlString(xmlDocStr);
           if(xmlDoc!=null)
               return this.xml2json(xmlDoc);
           else
               return null;
       };
   
       this.json2xml_str = function (jsonObj) {
           return parseJSONObject ( jsonObj, "" );
       };
   
       this.json2xml = function (jsonObj) {
           var xmlDocStr = this.json2xml_str (jsonObj);
           return this.parseXmlString(xmlDocStr);
       };
       
       this.getVersion = function () {
           return VERSION;
       };	
   }
}))

async function parse_msg2(msg) {
    var r_msg = msg;
    console.log("parsing message", r_msg);
    global_background_message_log.push(msg);

    async function do_action() {
        if (r_msg.action == "method") {
            switch (r_msg.name) {
                case "ScrapePepBoysInventory":
                    console.log("calling ScrapePepBoysInventory");
                    return await ScrapePepBoysInventory();
                    
                case "GetPepBoysCurrentStore":
                    return await GetPepBoysCurrentStore();
                    
                case "GetPepboysStores":
                    return await GetPepboysStores(r_msg.params);

                case "ClearAllCookies":
                    return ClearAllCookies();

                case "ScrapePepBoysProduct":
                    return await ScrapePepBoysProduct();
                case "ScrapeDiscountTireInventory":
                    return await ScrapeDiscountTireInventory(r_msg.params);
                case "GetDiscountTireStores":
                    return await GetDiscountTireStores(r_msg.params);
                case "GetTireChoiceStores":
                    return await GetTireChoiceStores(r_msg.params);
                case "ScrapeAmericasTireInventory":
                    return await ScrapeAmericasTireInventory(r_msg.params);
                case "ScrapeFirestoneInventory":
                    return await ScrapeFirestoneInventory(r_msg.params);
                case "ScrapeFirestoneProductDetails":
                    return await ScrapeFirestoneProductDetails(r_msg.params);
                case "ScrapeGoodYearInventory":
                    return await ScrapeGoodYearInventory(r_msg.params);
                case "GetGoodYearStores":
                    return await GetGoodYearStores();
                case "ScrapeWalmartInventory":
                    return await ScrapeWalmartInventory(r_msg.params);
                case "ScrapeTireRackInventory":
                    return await ScrapeTireRackInventory();
                case "ScrapeTireRackReviews":
                    return await ScrapeTireRackReviews(r_msg.params);
                case "ScrapeTiresPlusInventory":
                    return await ScrapeTiresPlusInventory(r_msg.params);
                case "ScrapeTiresPlusProductDetails":
                    return await ScrapeTiresPlusProductDetails(r_msg.params);
                case "GetTireDiscountTireSizes":
                    return await GetTireDiscountTireSizes(r_msg);
                case "GetTireDiscountersStoreNum":
                    return await GetTireDiscountersStoreNum(r_msg);
                case "ScrapeTireDiscountersInventory":
                    return await ScrapeTireDiscountersInventory(r_msg);
                case "GetTireDiscountersTireSizes":
                    return await GetTireDiscountersTireSizes(r_msg);
                case "GetTireAmericasTireSizes":
                    return await GetTireAmericasTireSizes(r_msg);
                case "GetTireAmericanTireDepotSizes":
                    return await GetTireAmericanTireDepotSizes(r_msg);
                case "GetTireFirestoneSizes":
                    return await GetTireFirestoneSizes(r_msg);
                case "GetTireTiresPlusSizes":
                    return await GetTireTiresPlusSizes(r_msg);
                case "GetTireGoodYearSizes":
                    return await GetTireGoodYearSizes();
                case "GetBigOTiresTireSizes":
                    return await GetBigOTiresTireSizes();
                case "GetTireWalmartSizes":
                    return await GetTireWalmartSizes();
                case "GetTireMavisSizes":
                    return await GetTireMavisSizes();
                case "ScrapeMavisInventory":
                    return await ScrapeMavisInventory(r_msg.params);
                case "GetMavisCurrentStore":
                    return await GetMavisCurrentStore(r_msg.params);
                case "SetMavisStore":
                    return await SetMavisStore(r_msg.params);
                case "GetMavisStores":
                    return await GetMavisStores(r_msg.params);
                case "GetWalmartStoreNum":
                    return await GetWalmartStoreNum();
                case "ScrapeWalmartProductDetails":
                    return await ScrapeWalmartProductDetails();
                case "GetWalmartStores":
                    return await GetWalmartStores(r_msg.params);
                case "GetCostcoStoreNum":
                    return await GetCostcoStoreNum();
                case "SetCostcoStoreNum":
                    return await SetCostcoStoreNum(r_msg.params);
                case "LoginCosco":
                    return await LoginCosco(r_msg.params);
                case "ScrapeCostcoInventory":
                    return await ScrapeCostcoInventory(r_msg.params);
                case "SelectCostcoTireSize":
                    return await SelectCostcoTireSize(r_msg.params);
                case "GetTireCostcoSizes":
                    return await GetTireCostcoSizes();
                case "ScrapeTireChoiceInventory":
                    return await ScrapeTireChoiceInventory();
                case "GetTireChoiceStore":
                    return await GetTireChoiceStore();
                case "ScrapeMonroInventory":
                    return await ScrapeMonroInventory();
                case "GetMonroStore":
                    return await GetMonroStore();
                case "GetBelletireHash":
                    return await GetBelletireHash(r_msg.params);
                case "GetBelleTireInventory":
                    return await GetBelleTireInventory(r_msg.params);
                case "SetBelletireStore":
                    return await SetBelletireStore(r_msg.params);
                case "SetBelletireStoreZip":
                    return await SetBelletireStoreZip(r_msg.params);
                case "WhereAmI":
                    return await WhereAmI();
                default: throw "Invalid Method";
            }
        } else {
            console.log("Invalid Message:", r_msg);
            throw "Invalid Message";
        }
    }

    try 
    {
        var action_result = await do_action();
        if (await block_check()) 
            {return {response_code: 400, response: document.title}};
        return { response_code: 200, response: await action_result, page_tile: document.title };
    } catch (error) 
    {
        console.log(error);
        if (typeof(error) != 'object') {
            error.toString();
        }
        return {response_code : 400,  response: error, page_tile: document.title};
    }

}


async function block_check() {
    function walmart_block_check() {
        if (location.href.includes("walmart.com")) {
            wally_global = document.getElementById('__NEXT_DATA__').textContent
            wally_global = JSON.parse(wally_global)
            console.log(wally_global.props.pageProps.psych)
            return wally_global.props.pageProps.psych.isBot
        }
        else {
            return false
        }
    }

    let blocked = false;
    if (document.title.toLowerCase().includes('denied') || document.title.toLowerCase().includes('robot') || walmart_block_check()) { blocked = true };
    return blocked;
}


async function start() {
    await connect_to_background()

    var ready =  true
    console.log("posting message", ready);
    x = await send_message({ ready: ready, location: location.href, page_tile: document.title, blocked: await block_check(), msg:'ScriptStarted'  });

    console.log("global_background_message_log:", global_background_message_log);
    sleep(1000)
    if (global_background_message_log == []) {console.log('reconnecting to background') ;start()}
}


async function test() {
    const loopTime = 5;
    console.log("posting message");
    for (let i = 0; i < loopTime; i++) {
        console.log(`Iteration is #${i}`);
        // scroll to the bottom to load more data
        // const scrollingElement = (document.scrollingElement || document.body);
        // scrollingElement.scrollTop = scrollingElement.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);

        await sleep(1000);
    }
    send_message({ ready: true, location: location.href });

}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        waitForJquery(start);
    }
  }
console.log("content script loaded");

// -------------------------------------------------------------------------
// System
// -------------------------------------------------------------------------
var varConstantMock = ` 
    var fetch_data = [];
    const constantMock = window.fetch;
    window.fetch = function() {
        fetch_data.push(arguments)
        console.log(arguments)
        return constantMock.apply(this, arguments)
    }
`


var secretKey = '9d8yheHcQww0jmqL2Tqc';




function loadCryptoJSLibrary() {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js";
        script.onload = () => resolve();  // Resolve the promise upon successful loading
        script.onerror = () => reject("Failed to load CryptoJS");  // Reject the promise on error
        document.head.appendChild(script);
    });
}

async function initializeCryptoOperations() {
    try {
        await loadCryptoJSLibrary();  // Wait until CryptoJS is loaded
        window.generateAuthHash = function(data, secretKey) {  // Define function after CryptoJS is available
            return CryptoJS.HmacSHA256(data, secretKey).toString(CryptoJS.enc.Base64);
        };
        // Now it's safe to call generateAuthHash or any other functions that depend on CryptoJS
        console.log("CryptoJS loaded and functions are ready to use.");
    } catch (error) {
        console.error("Error during CryptoJS initialization:", error);
    }
}

initializeCryptoOperations();  // Call this function on script load or when needed



if (location.href.includes("belletire")) {
    console.log("########### START varConstantMock");
    exec_page_script(varConstantMock);
    

}

async function scrape_first_night (country, lang) {
    country = '172'
    lang = 'en'
    total_pages = undefined
    resp = await fetch(`https://first-night.com/api/girls?filter_type=all&page=1&lang=${lang}&count=100&country=${country}`, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImNhNDRiODIyMDA0MDY1OGY4OTg3NzVlZDkzYzliYmU0MWFiY2M2NWI0ZTEwYjhiY2RjODAzYmM5MWU1ZGNhNzRkMzE0ZWNmNjBiYmVlODk1In0.eyJhdWQiOiIxIiwianRpIjoiY2E0NGI4MjIwMDQwNjU4Zjg5ODc3NWVkOTNjOWJiZTQxYWJjYzY1YjRlMTBiOGJjZGM4MDNiYzkxZTVkY2E3NGQzMTRlY2Y2MGJiZWU4OTUiLCJpYXQiOjE3MTY5NjYxMzksIm5iZiI6MTcxNjk2NjEzOSwiZXhwIjoxNzQ4NTAyMTM5LCJzdWIiOiI1MTI0NCIsInNjb3BlcyI6W119.CwEjlTAAgiq3qNIPZrlSB-qEEFh1Tzp8S5uUmHkESL1jq4l-TU07jl1W9bB5EzavOCQNj9l5-lgcGnFZAYnUxdJbT1CIvPxXYlvKEa4Upb6BgT7MEUC6GuV76-TDbrEROvfI4bgynW6OP4n7D865fyVcnXepreapVRLSgtQLvEqXWM0sPgLxXs61-M1gL9XPQVq-a-l6Gk76EqpiVDeiLmMVft8SlMHBrLAA1Z2L5cTs_5O887HnyF0kWe11d4nY0aSkdRpwxTM2qzx6PMxv3gYG-vsikASrqKIjjW6G_v42j9s7yRfsjq1nOdpz0-UlHyXt1gcm3JOPUhpdK_hT8zjOWBwiDCrEtVZ-SgSu9ovE1Mp2WQ2Mt0Cwv24UAPX-mDjb6yc3xpUhk8mrzUEaaItmAnbit5_vZ04SJJAXWw7gasiLT4bFOPeP3X4tjB2TlLd-8E273BB2TZSsMgUF8SNdnCOqLsvdR0PCPWugQQcfN81R0UWbPOZ2XMhbkNlNcRZok8j1ejuH1hYv6F83zwmijWGPaD1_RX7Bgq5F6NI9iLrOHqBzMKJvkozgG-u9iQGNKRz-ACF3V7tcPVGJudIDXOToyhJsMZ2Gc1OrVFH93y5xhHBJWq03BDpO73A8fjPDxkmb67Dj3r2E4K-aczBOgHPlO2gFGyRBe8ed3CI",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Brave\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1"
        },
        "referrer": "https://first-night.com/ru",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      });
      x = await resp.json()
      total_pages = x.meta.last_page
    //   total_pages = 3
      var listings = []
      listings = listings.concat(x.data)
      start_from_page = 2
      page_array = Array.from(new Array(total_pages), (x, i) => i + start_from_page)

      for (i in page_array){
        console.log(i)
        page_num = page_array[i]
        resp = await fetch(`https://first-night.com/api/girls?filter_type=all&page=${page_num}&lang=${lang}&count=100&country=${country}`, {
            "headers": {
              "accept": "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9",
              "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImNhNDRiODIyMDA0MDY1OGY4OTg3NzVlZDkzYzliYmU0MWFiY2M2NWI0ZTEwYjhiY2RjODAzYmM5MWU1ZGNhNzRkMzE0ZWNmNjBiYmVlODk1In0.eyJhdWQiOiIxIiwianRpIjoiY2E0NGI4MjIwMDQwNjU4Zjg5ODc3NWVkOTNjOWJiZTQxYWJjYzY1YjRlMTBiOGJjZGM4MDNiYzkxZTVkY2E3NGQzMTRlY2Y2MGJiZWU4OTUiLCJpYXQiOjE3MTY5NjYxMzksIm5iZiI6MTcxNjk2NjEzOSwiZXhwIjoxNzQ4NTAyMTM5LCJzdWIiOiI1MTI0NCIsInNjb3BlcyI6W119.CwEjlTAAgiq3qNIPZrlSB-qEEFh1Tzp8S5uUmHkESL1jq4l-TU07jl1W9bB5EzavOCQNj9l5-lgcGnFZAYnUxdJbT1CIvPxXYlvKEa4Upb6BgT7MEUC6GuV76-TDbrEROvfI4bgynW6OP4n7D865fyVcnXepreapVRLSgtQLvEqXWM0sPgLxXs61-M1gL9XPQVq-a-l6Gk76EqpiVDeiLmMVft8SlMHBrLAA1Z2L5cTs_5O887HnyF0kWe11d4nY0aSkdRpwxTM2qzx6PMxv3gYG-vsikASrqKIjjW6G_v42j9s7yRfsjq1nOdpz0-UlHyXt1gcm3JOPUhpdK_hT8zjOWBwiDCrEtVZ-SgSu9ovE1Mp2WQ2Mt0Cwv24UAPX-mDjb6yc3xpUhk8mrzUEaaItmAnbit5_vZ04SJJAXWw7gasiLT4bFOPeP3X4tjB2TlLd-8E273BB2TZSsMgUF8SNdnCOqLsvdR0PCPWugQQcfN81R0UWbPOZ2XMhbkNlNcRZok8j1ejuH1hYv6F83zwmijWGPaD1_RX7Bgq5F6NI9iLrOHqBzMKJvkozgG-u9iQGNKRz-ACF3V7tcPVGJudIDXOToyhJsMZ2Gc1OrVFH93y5xhHBJWq03BDpO73A8fjPDxkmb67Dj3r2E4K-aczBOgHPlO2gFGyRBe8ed3CI",
              "cache-control": "no-cache",
              "pragma": "no-cache",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Brave\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "sec-gpc": "1"
            },
            "referrer": "https://first-night.com/ru",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
          });
          x = await resp.json()
          if (x.data.length > 0) {
            listings = listings.concat(x.data)}

          console.log(x.data)
          await sleep(500)

      }

      console.log(listings)
      return listings



}

result = await scrape_first_night()


async function add_link_to_page_for_each_result (array_result)
{   var new_results = []
    for (i in array_result)
    {
        profile_object = array_result[i]
        profile_id = profile_object.id
        link = `https://first-night.com/ru/girls/${profile_id}`
        profile_object['link'] = link
        new_results.push(profile_object)
    }
    return new_results
}
new_result = await add_link_to_page_for_each_result(result)

async function filter_by_age (age, profiles) {
    var new_profiles = []
    for (i in profiles)
    {
        profile = profiles[i]
        if (profile.age <= age)
        {
            new_profiles.push(profile)
        }
    }
    return new_profiles
}
filtered_result = await filter_by_age(18, new_result)

async function create_links(filtered_result) {
    var links = []
    for (i in filtered_result) {
        profile = filtered_result[i]
        link = profile.link
        links.push(link)
    }
    return links
}

async function post_message(links) {
    fetch("https://first-night.com/api/messages?lang=ru", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImNhNDRiODIyMDA0MDY1OGY4OTg3NzVlZDkzYzliYmU0MWFiY2M2NWI0ZTEwYjhiY2RjODAzYmM5MWU1ZGNhNzRkMzE0ZWNmNjBiYmVlODk1In0.eyJhdWQiOiIxIiwianRpIjoiY2E0NGI4MjIwMDQwNjU4Zjg5ODc3NWVkOTNjOWJiZTQxYWJjYzY1YjRlMTBiOGJjZGM4MDNiYzkxZTVkY2E3NGQzMTRlY2Y2MGJiZWU4OTUiLCJpYXQiOjE3MTY5NjYxMzksIm5iZiI6MTcxNjk2NjEzOSwiZXhwIjoxNzQ4NTAyMTM5LCJzdWIiOiI1MTI0NCIsInNjb3BlcyI6W119.CwEjlTAAgiq3qNIPZrlSB-qEEFh1Tzp8S5uUmHkESL1jq4l-TU07jl1W9bB5EzavOCQNj9l5-lgcGnFZAYnUxdJbT1CIvPxXYlvKEa4Upb6BgT7MEUC6GuV76-TDbrEROvfI4bgynW6OP4n7D865fyVcnXepreapVRLSgtQLvEqXWM0sPgLxXs61-M1gL9XPQVq-a-l6Gk76EqpiVDeiLmMVft8SlMHBrLAA1Z2L5cTs_5O887HnyF0kWe11d4nY0aSkdRpwxTM2qzx6PMxv3gYG-vsikASrqKIjjW6G_v42j9s7yRfsjq1nOdpz0-UlHyXt1gcm3JOPUhpdK_hT8zjOWBwiDCrEtVZ-SgSu9ovE1Mp2WQ2Mt0Cwv24UAPX-mDjb6yc3xpUhk8mrzUEaaItmAnbit5_vZ04SJJAXWw7gasiLT4bFOPeP3X4tjB2TlLd-8E273BB2TZSsMgUF8SNdnCOqLsvdR0PCPWugQQcfN81R0UWbPOZ2XMhbkNlNcRZok8j1ejuH1hYv6F83zwmijWGPaD1_RX7Bgq5F6NI9iLrOHqBzMKJvkozgG-u9iQGNKRz-ACF3V7tcPVGJudIDXOToyhJsMZ2Gc1OrVFH93y5xhHBJWq03BDpO73A8fjPDxkmb67Dj3r2E4K-aczBOgHPlO2gFGyRBe8ed3CI",
          "cache-control": "no-cache",
          "content-type": "application/json;charset=UTF-8",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Brave\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1"
        },
        "referrer": "https://first-night.com/ru",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"content\":\"?\",\"user_to\":44167}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      });
}


async function logClickableLinks(links) {
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        console.log(`%c${link}`, 'color: blue; text-decoration: underline; cursor: pointer;');
    }
}

// Call the functions
