// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
random_wait = getRandomInt(3000, 50000)
var ws = undefined;
var var_websocket_url = "ws://backend:8087/";
// var var_websocket_url = "ws://localhost:8087/";
var content_script_loaded = false;
var message_sent = false;
var message_recieved = false;
var chrome_tab_id;
var last_message_sent_to_backend_time = undefined;
var port = undefined 
var error;
var max_sleep_interation = 40;
var use_proxy = false;
var tirekingdom_default_sleep_ms = 1000;
var content_script_location = undefined
var content_request_list = []

function on_response (comm_port) {
    port = comm_port;
    port.onMessage.addListener(function(msg) {
        message_recieved = true
        console.log("Message from content script:", msg);
        if (msg.ready && !msg.blocked) {
            content_script_loaded = true;
            console.log("Content script loaded", content_script_loaded);
            content_script_location = msg.location;
            // content_response_list.push(msg);
            return true;

        }
        else {
            content_script_location = msg.location;
            parse_content_response(msg);
        }
    });
}


async function url_req(url, data, method = "GET", headers) {
    try {
        if (headers)
        {
            var rawResponse = await fetch(url, headers);
            var content = await rawResponse.json();
            return await content;
        }
        else if (method == "GET") {
            return await fetch(url);
        }
        else if (method == "JGET") {
            var rawResponse = await fetch(url);
            return await rawResponse.json();


        }
        else if (method == "POST") {
            const rawResponse = await fetch(url, {
                method: method,
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const content = await rawResponse.json();

            return await content;
        }
        else if (method == "BIGOTIRESPOST") {
            const rawResponse = await fetch(url, {
                method: method,
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json;charset=UTF-8",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-by": "123",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://www.bigotires.com/home",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "method": "POST",
                "mode": "cors",
                "credentials": "include",
                body: JSON.stringify(data)
            });
            const content = await rawResponse.json();

            return await content;
        }
        else if (method == "HGET") {
            const rawResponse = await fetch(url, {
                method: "GET",
                headers: data,
            });

            return true;
        }
        else if (method == 'WALMART2') {
            var rawResponse = await fetch(url, {
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
                        "wm_page_url": content_script_location,
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
                    "referrer": content_script_location,
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": data,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                    });
                    var content = await rawResponse.json();
                    return await content;
        
            }
        else if (method == 'TIREDISCOUNTERS') {
            var rawResponse = await fetch(url, {
                    "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-csrf-token": "owh5E1AK-cDiv2O90VCfHkudps2YMRGybSbLcolp2I8"
                    },
                    "referrer": "https://tirediscounters.com/finder/results?searchMethod=searchBySize&tireWidth=255&aspectRatio=70&rimSize=16&page=1&price=275",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": data,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                
                    });
                    var content = await rawResponse.json();
                    return await content;
        
            }
        else if (method == "BelleTireStores") {
            const rawResponse = await fetch(url, {
                headers: {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "auth-hash": data.hash,
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "downlink": "10",
                    "dpr": "1",
                    "ect": "4g",
                    "pragma": "no-cache",
                    "rtt": "50",
                    "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "viewport-width": "1562"
                    },
                    "referrer": "https://www.belletire.com/stores",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": data.body,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
            });
            const content = await rawResponse.json();

            return await content;
        }
        else {
            throw "Invalid Method";
        }

    } catch (error) {
        console.log("Error in url_req:", error);
        return error.message;
    }
}



  
async function remove_browser_data (callback) {
    var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
    try {
        chrome.browsingData.remove({
        "since": oneWeekAgo
        }, {
        "appcache": true,
        "cache": true,
        "cacheStorage": true,
        "cookies": true,
        "downloads": true,
        "fileSystems": true,
        "formData": true,
        "history": true,
        "indexedDB": true,
        "localStorage": true,
        "passwords": true,
        "serviceWorkers": true,
        "webSQL": true
        }, async function (callback) { if (typeof callback === "function"  ) {await callback()} }  );
    console.log('cleared all browser history')
    }

    catch {stuck_check() }
}
  async function restart_chrome(){
    await close_scrapper_tabs(true);
    console.log('RESTARTING CHROME')
    try {
        await chrome.runtime.reload()
    }
    catch {await sleep(2000);  stuck_check()}

}
async function sleep(ms, i=max_sleep_interation) {
    if (i > max_sleep_interation) {
        // restart doesnt work for some reason
        // parse_msg({action: "navigate", url: "chrome://restart"}); 
        await remove_browser_data(close_scrapper_tabs(true));
        await restart_chrome()

    }
    // console.log('sleeping iter', i )
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function send_response_to_backend(response) {
    last_message_sent_to_backend_time = new Date()
    console.log("send_response_to_backend:", response);
    await ws.send(JSON.stringify(response));
    sleep(100)
    return true;
}


var content_response_list = [];

async function parse_content_response(msg) {
    console.log("parse_content_response:", msg);
    if (msg.page_tile) {
        if (msg.page_tile == "Access to this page has been denied." || msg.blocked === true) {
            console.log('WE ARE BLOCKED');
            await sleep(15000)
            await remove_browser_data();
            await restart_chrome()
            await close_scrapper_tabs(true);
            // throw(msg.page_tile)

            // ++block_count;
        }
    }
    content_response_list.push(msg);
    message_recieved = false;
    message_sent = false;

}

async function parse_msg(msg) {
    const r_msg = msg;
    async function do_action() {
        var url;
        if (msg.page_tile)
        {
            if (msg.page_tile.includes('Denied') || msg.blocked === true) {
                console.log('PAGE WAS BLOCKED', msg.page_tile)
                await remove_browser_data(close_scrapper_tabs(true));
                throw (msg)
            } 

        }
        else if (r_msg.action == "navigate") {
            console.log("Navigating to:", r_msg.url);
            if (use_proxy) {
                url = r_msg.url
            
            }
            else {
                url = r_msg.url;
            }
            content_script_loaded = false;
            chrome.tabs.create({ url: url });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {chrome_tab_id = tabs[0].id});
            
            var i = 0;
            while (!content_script_loaded) 
            {
                 await sleep(1000, i); console.log("Waiting for content script to load..."); i++;
                 if (i === 10)
                 {
                    console.log('slow network detected')
                    max_sleep_interation = max_sleep_interation * 3 
                    //content_script_loaded = true //mma
                 }
            };
            return content_script_loaded;
        }
        else if (r_msg.action == "post") {
            console.log("Posting to:", r_msg.url);

            return url_req(r_msg.url, r_msg.payload, "POST")
        }
        
        else if (r_msg.action == "hget") {
            console.log("get with headers to:", r_msg.url);

            return url_req(r_msg.url, r_msg.headers, "HGET")
        }

        else if (r_msg.action == "get") {
            console.log("get:", r_msg.url);

            return url_req(r_msg.url, "GET")
        }

        else if (r_msg.action == "jget") {
            console.log("GET:", r_msg.url);
            return url_req(r_msg.url, null, "JGET")

        }
        else if (r_msg.action == "method") {
            switch (r_msg.name) {
                case "ClearAllCookies": let x = await ClearAllCookies(); console.log(x); break;

                case "GetLatLong": return await GetLatLong(r_msg.args);

                case "GetPepBoysInventory": return await GetPepBoysInventory(r_msg.args);
                case "GetPepBoysProductDetails": return await GetPepBoysProductDetails(r_msg.args);
                case "GetPepboysStores": return await GetPepboysStores(r_msg.args);
                // case "PepBoysValidateStoreID": return await send_message_to_content(r_msg.args[0]); break;

                case "GetTireKingdomInventory": return await GetTireKingdomInventory(r_msg.args);
                case "GetTireKingdomProductDetails": return await GetTireKingdomProductDetails(r_msg.args);
                case "GetTireKingdomStores": return await GetTireKingdomStores(r_msg.args);

                case "GetMidasStores": return await GetMidasStores(r_msg.args);
                case "GetMidasInventory": return await GetMidasInventory(r_msg.args);

                case "GetNtbInventory": return await GetNtbInventory(r_msg.args);
                case "GetNtbStores": return await GetNtbStores(r_msg.args);
                case "GetNtbProductDetails": return await GetNtbProductDetails(r_msg.args);

                case "GetBigOTiresInventory": return await GetBigOTiresInventory(r_msg.args);
                case "GetBigOTiresStores": return await GetBigOTiresStores(r_msg.args);

                case "GetDiscountTireInventory": return await GetDiscountTireInventory(r_msg.args);
                case "GetDiscountTireStores": return await GetDiscountTireStores(r_msg.args);

                case "GetAmericasTireInventory": return await GetAmericasTireInventory(r_msg.args);

                case "GetFirestoneInventory": return await GetFirestoneInventory(r_msg.args);
                case "GetFirestoneStores": return await GetFirestoneStores(r_msg.args);
                case "GetFirestoneProductDetails": return await GetFirestoneProductDetails(r_msg.args);
                
                case "GetTiresPlusInventory": return await GetTiresPlusInventory(r_msg.args);
                case "GetTiresPlusProductDetails": return await GetTiresPlusProductDetails(r_msg.args);
                case "GetTiresPlusStores": return await GetTiresPlusStores(r_msg.args);

                case "GetTireRackInventory": return await GetTireRackInventory(r_msg.args);
                case "GetReviews": return await GetReviews(r_msg.args);

                case "GetGoodYearInventory": return await GetGoodYearInventory(r_msg.args);
                case "GetGoodYearTireSizes": return await GetGoodYearTireSizes(r_msg.args);
                case "GetGoodYearStores": return await GetGoodYearStores(r_msg.args);

                case "GetWalmartInventory": return await GetWalmartInventory(r_msg.args);
                case "GetWalmartProductDetails": return await GetWalmartProductDetails(r_msg.args);
                case "GetWalmartStores": return await GetWalmartStores(r_msg.args);

                case "GetMavisInventory": return await GetMavisInventory(r_msg.args);
                case "GetMavisStores": return await GetMavisStores(r_msg.args);

                case "GetTireChoiceInventory": return await GetTireChoiceInventory(r_msg.args);
                case "GetTireChoiceStores": return await GetTireChoiceStores(r_msg.args);

                case "GetMonroInventory": return await GetMonroInventory(r_msg.args);
                case "GetCostcoInventory": return await GetCostcoInventory(r_msg.args);

                case "GetAmericanTireDepotInventory": return await GetAmericanTireDepotInventory(r_msg.args);
                
                case "GetBelleTireInventory": return await GetBelleTireInventory(r_msg.args);
                case "GetBelletireStores": return await GetBelletireStores(r_msg.args);

                case "GetTireDiscountersInventory": return await GetTireDiscountersInventory(r_msg.args);
                case "GetTireDiscountersStores": return await GetTireDiscountersStores(r_msg.args);

                default: throw Error("Invalid Method");
            }
        }
        else if (r_msg.action == "shutdown") {
            console.log("Shutting down");
            await ws.close();
            throw "Shutting down";

        }
        else {
            console.log("Invalid Message:", r_msg);
            throw Error("Invalid Message");
        }
    }

    try {
        var action_result = await do_action();
        var response_code = 200;
        if ((action_result === typeof(Object)) && (action_result.hasOwnProperty('error')))
        {
            if (action_result.error)
            {
                throw action_result
            }
        }
    
    return { response_code: response_code, result: await action_result, inventory_exists: inventory_exists_check(msg, await action_result) };
    } catch (error) {
        console.log(error);
        return {response_code : 400,  result: error};
    }
}
function inventory_exists_check(params, response) {
    let inventory_exists = false; 
    var retailer_code = params.retailer_code;

    try { if (response.hasOwnProperty('inventory_exists')) {inventory_exists = response.inventory_exists} } catch(error) {console.log('No Inventory exists flag', error)}

    if (retailer_code === 'WALMART') {
        try {if (response[0].aggregatedCount > 0) {inventory_exists = true}} catch (error) {console.log('No Inventory exists flag', error)}
        response.inventory_exists = inventory_exists
    }
    return inventory_exists

}
async function send_message_to_content(msg, w=0) {
    if (content_script_loaded == false){ 
         await sleep(2500, w)
         return await send_message_to_content(msg, ++w);
    }
    try {
        console.log("Sending message to content script:", msg, content_response_list.length);
        await port.postMessage(msg);

    } catch (error) {
        console.log("Error in send_message_to_content:", error);
        // port = await chrome.runtime.onConnect.addListener(on_response);
        chrome.tabs.query({ }, function (tabs) {chrome_tab_id = tabs[0].id; console.log(tabs)});
        await reload_tab(chrome_tab_id);
        // chrome.tabs.connect(chrome_tab_id)
        send_message_to_content(msg, ++w);
        // restart_chrome();
        // throw error;
        // await close_scrapper_tabs(true);
    }
    // message_sent = true;
    // message_recieved = false;
    console.log("Message sent to content script:", msg);
    content_request_list.push(msg);
    let i = 0;
    let req = content_request_list.length
    let res = content_response_list.length
    while (req != res) {
        console.log("Waiting for response from content script", i, req, res);
        req = content_request_list.length
        res = content_response_list.length
        if (req === res) {break}

        await sleep(500, i);
        i++;
        if (i === parseInt(max_sleep_interation / 2)) {
            // for some reason messages get sent be not recieved
            //  in the content script, even when the content script is ready 
            // and sitting still 
            console.log("Resending message to content script");
            await port.postMessage(msg);
        
        }

    }
    console.log('message recieved');
    return true;


}


async function reload_tab (chrome_tab_id){
    await chrome.tabs.reload(
        chrome_tab_id,
        // reloadProperties?: object,
        // function (current_store_num, expected_store_num, iteration) {}
      )
      content_script_loaded = false;
      var i = 0;
      while (!content_script_loaded) { await sleep(1000, i); console.log("Waiting for content script to load..."); i++};


}

async function ValidatePepboysStoreNum(current_store_num, expected_store_num, iteration = 0) {
    if (current_store_num == expected_store_num) {
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            await parse_msg({ action: "get", url: `https://www.pepboys.com/addselectedstore?storeid=${expected_store_num}` });
            console.log("refreshing tabid", chrome_tab_id);
            await reload_tab(chrome_tab_id);
            
            return await ValidatePepboysStoreNum(await GetPepboysStoreNum(), expected_store_num, iteration + 1);
        }
        else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); return current_store_num;}
    }
}



async function ValidateTireKingdomStoreNum(current_store_num, expected_store_num, iteration = 0) {
    if (current_store_num == expected_store_num) {
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            await url_req(`https://www.tirekingdom.com/rest/model/com/tbc/profile/ProfileService/addStoreToProfile?q=${await create_random_char_str()}`,{storeNum: expected_store_num} , "POST");
            console.log("refreshing tabid", chrome_tab_id);
            await reload_tab(chrome_tab_id);
            
            return await ValidateTireKingdomStoreNum(await GetTireKingdomStoreNum(), expected_store_num, iteration + 1);
        }
        else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); return current_store_num;}
    }
}


async function ValidateBigOTiresStoreNum(current_store_num, expected_store_num, iteration = 0, url) {
    if (current_store_num == expected_store_num) {
        // we sleep here since we call get inventory thrice 
        // once to get the store num 
        // once to validate the store num and 
        // once to get the inventory 
        // to many request results in 502 error
        await sleep(500) 
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            await url_req('https://www.bigotires.com/restApi/dp/v1/currentUser/addStoreToProfile',{storeNum: expected_store_num} , "BIGOTIRESPOST");
            console.log("refreshing tabid", chrome_tab_id);
            await reload_tab(chrome_tab_id);
            
            return await ValidateBigOTiresStoreNum(await GetBigOTiresStoreNum(url), expected_store_num, iteration + 1, url);
        }
        else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); return current_store_num;}
    }
}

async function ValidateNtbStoreNum(current_store_num, expected_store_num, iteration = 0) {
    if (current_store_num == expected_store_num) {
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            await url_req(`https://www.Ntb.com/rest/model/com/tbc/profile/ProfileService/addStoreToProfile?q=${await create_random_char_str()}`,{storeNum: expected_store_num} , "POST");
            console.log("refreshing tabid", chrome_tab_id);
            await reload_tab(chrome_tab_id);
        
            return await ValidateNtbStoreNum(await GetNtbStoreNum(), expected_store_num, iteration + 1);
        }
        else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); return current_store_num;}
    }
}

async function GetPepboysStoreNum() {
    command = {action: "method", name: "GetPepBoysCurrentStore"}
    command_complete = await send_message_to_content(command);
    if (command_complete) {

        let current_store_num = await content_response_list[content_response_list.length -1].response;
        return await current_store_num;}

    }
    
async function GetWalmartStoreNum() {
    command = {action: "method", name: "GetWalmartStoreNum"}
    command_complete = await send_message_to_content(command);
    if (command_complete) {
    
        let current_store_num = await content_response_list[content_response_list.length -1].response;
        return await current_store_num;}
    
    }

async function GetCostcoStoreNum() {
    command = {action: "method", name: "GetCostcoStoreNum"}
    command_complete = await send_message_to_content(command);
    if (command_complete) {
    
        let current_store_num = await content_response_list[content_response_list.length -1].response;
        return await current_store_num;}
    
    }

async function SetCostcoStoreNum(params) {
    command = {action: "method", name: "SetCostcoStoreNum", params: params}
    command_complete = await send_message_to_content(command);
    if (command_complete) {
    
    let current_store_num = await content_response_list[content_response_list.length -1].response;
    return await current_store_num;}

}



async function ValidateWalmartStoreNum(current_store_num, expected_store_num, iteration = 0, zip_code) {
    method = "WALMART2"
    body = undefined
    
    console.log("zip code ", zip_code);

    if (zip_code === undefined) {throw Error("zip_code is required for this method" , zip_code)}
    if (current_store_num === undefined) {current_store_num = await GetWalmartStoreNum();}
    fitmentFieldParams = {
        "variables": {
            "input": {
                "enableLiquorBox": true,
                "accessPointId": "3ff8787b-4959-483b-9965-d0a08ef6d714",
                "cartId": "00000000-0000-0000-0000-000000000000",
                "postalCode": zip_code.toString(),
                "storeId": parseInt(expected_store_num)
            },
            "includePartialFulfillmentSwitching": false,
            "enableAEBadge": true,
            "enableBadges": true,
            "includeExpressSla": true,
            "includeQueueing": true,
            "enableWeeklyReservationCartBookslot": true,
            "enableACCScheduling": true,
            "enableWalmartPlusFreeDiscountedExpress": true,
            "enableCartBookslotShortcut": false,
            "enableFutureInventoryCartBookslot": false,
            "enableWplusCashback": false
        }
    }
     
    console.log('Validate walmart store num', current_store_num, expected_store_num, iteration, zip_code);
    end_point = `https://www.walmart.com/orchestra/home/graphql/setPickup/a52fb72cca63e2b0512e420cd38a216d3a69880a572035a8166be633b74e1dae`
    body = JSON.stringify(fitmentFieldParams)
    

    if (current_store_num == expected_store_num) {
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            await url_req(end_point, body, method)
            console.log("refreshing tabid", chrome_tab_id);
            await reload_tab(chrome_tab_id);
            
            return await ValidateWalmartStoreNum(await GetWalmartStoreNum(), expected_store_num, iteration + 1, zip_code);
        }
        else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); return current_store_num;}
    }
}
async function ValidateCostcoStoreNum(current_store_num, expected_store_num, iteration = 0, zip_code) {

    console.log('Validate ValidateCostcoStoreNum store num', current_store_num, expected_store_num, iteration, zip_code);
    

    if (current_store_num == expected_store_num) {
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            current_store_num = await SetCostcoStoreNum({store_num: expected_store_num, zip_code: zip_code})

            if (current_store_num != expected_store_num) {
                throw {current_store_num: current_store_num, expected_store_num: expected_store_num, error: 'failed to set store num'}
            }
            return await ValidateCostcoStoreNum(await GetCostcoStoreNum(), expected_store_num, iteration + 1, zip_code);
        }
       else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); return current_store_num;}
    }
}

async function GetTireKingdomStoreNum() {
    command_complete = await url_req(
        url='https://www.tirekingdom.com/rest/model/com/tbc/profile/ProfileService/getMyStore', 
        data=undefined, 
        method='JGET');
    
    let current_store_num = undefined
    if (command_complete) {
        if (!command_complete.hasOwnProperty('storeDetails')) {
            throw  {error: 'response is missing storeDetails', response: command_complete}
        }
        else if (command_complete.storeDetails.status.description == "Success") {
            return current_store_num = command_complete.storeDetails.store.storeNumber;
        }
        else {current_store_num = command_complete.storeDetails.status}
        return await current_store_num;}
    else {
        console.log('command_complete', command_complete);
        throw "Could not get store number from Tire Kingdom"
    }

}

async function GetNtbStoreNum() {
    command_complete = await url_req(
        url='https://www.ntb.com/rest/model/com/tbc/profile/ProfileService/getMyStore', 
        data=undefined, 
        method='JGET');
    
    let current_store_num = undefined
    if (command_complete) {
        if (!command_complete.hasOwnProperty('storeDetails')) {
            throw  {error: 'response is missing storeDetails', response: command_complete}
        }
        else if (command_complete.storeDetails.status.description == "Success") {
        return current_store_num = command_complete.storeDetails.store.storeNumber;
        }
        else {current_store_num = command_complete.storeDetails.status}
        return await current_store_num;}
    else {
        console.log('command_complete', command_complete);
        throw "Could not get store number from Tire Kingdom"
    }

}

async function GetBigOTiresStoreNum(url) {
    command_complete = await url_req(
        url=url, 
        data=undefined, 
        method='JGET');
        
    let current_store_num = undefined
    if (command_complete) {
        if (!JSON.stringify(command_complete).includes('SAPStoreNumber')) {
            // throw  {error: 'response is missing storeDetails', response: command_complete}
            return null
        }
        else if (command_complete.contents[0].header[0].contents[0].headerContentBlock[1].headerDesktopMainContentTop[1].StoreDetails.status.description == "Success") {
            current_store_num = command_complete.contents[0].header[0].contents[0].headerContentBlock[1].headerDesktopMainContentTop[1].StoreDetails.store.SAPStoreNumber
            return await current_store_num
            
        }
        else {current_store_num = command_complete.contents[0].header[0].contents[0].headerContentBlock[1].headerDesktopMainContentTop[1].StoreDetails.status}
        return await current_store_num;}
    else {
        console.log('command_complete', command_complete);
        throw "Could not get store number from Big O Tires"
    }

}


async function ScrapePepBoysInventory() {
    command = {action: "method", name: "ScrapePepBoysInventory"}
    command_complete = await send_message_to_content(command);
    if (command_complete) {
        let response = await content_response_list[content_response_list.length -1].response;
        // console.log(content_response_list, content_response_list.length, response);
        return await response;
    }
}

async function ScrapeTireKingdomInventory(url) {
    command_complete = await url_req(url=url, data=undefined, method='JGET')
    sleep(tirekingdom_default_sleep_ms);
    if (command_complete) {
        let response = command_complete
        // console.log(content_response_list, content_response_list.length, response);
        return await response;
    }
}

async function GetMidasInventory(params) {
    await sleep(500)
    const { width, radius, diameter, store_num } = params;
    var command = {action: "navigate", url: "https://www.midas.com/"}

    await WhereIsClientScript(command, "midas.com")

    const tiresRequestUrl = `https://service.midas.com/Services/Rest/TiresServices.svc/gettireslist?ss=${width}/${radius}r${diameter}&storeNo=${store_num}&ssr=&loadindex=&speedrating=`;
    const tiresResponse = await url_req(
        url=tiresRequestUrl,
        data=undefined,
        method='JGET')


    const tiresData = await tiresResponse

    if (!tiresData) {
        throw new Error("Failed to fetch tires data.");
    }

    // Return the fetched tires data
    return tiresData;
}

async function GetMidasStores(params) {
    await sleep(500)
    const { zip_code } = params;

    // Step 1: Look up DMA
    const dmaRequestUrl = `https://www.midas.com/partialglobalsearch/getredirectdmaurl?zipcode=${zip_code}&language=en-us`;
    const dmaResponse = await fetch(dmaRequestUrl);
    const dmaData = await dmaResponse.json();

    if (!dmaData.DmaNumber || !dmaData.Url) {
        throw new Error("Failed to fetch DMA data.");
    }

    // Step 2: Look up stores by DMA + zip
    const storeRequestUrl = `https://www.midas.com/getstoreslistasjson?dmanum=${dmaData.DmaNumber}&zipproxsort=${zip_code}`;
    const storeResponse = await fetch(storeRequestUrl);
    const storeData = await storeResponse.json();

    // Return both objects (dmaData and storeData) in an array
    return [dmaData, storeData];
}


async function GetTireKingdomStores(params) {
    // close browser tabs
    // await close_scrapper_tabs(true);

    const zip_code = params.zip_code;
    const latitude = params.latitude;
    const longitude = params.longitude;
    const req_url = `https://www.tirekingdom.com/rest/model/com/tbc/store/StoreLocatorService/getStoresByLatitudeAndLongitude?q=${await create_random_char_str()}`;
    const url = `https://www.bigotires.com/store-locator/`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "tirekingdom.com");
    // make HTTP request and get response data

    headers = {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json;charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
                },
  "referrer": "https://www.tirekingdom.com/storelocator/search",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": JSON.stringify({latitude: latitude, longitude: longitude}),
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
    }
    const response = await fetch(req_url, headers);
    const responseData = await response.json();
    return responseData;
  }

async function ScrapeBigOTiresInventory(url) {
    command_complete = await url_req(url=url, data=undefined, method='JGET')
    sleep(tirekingdom_default_sleep_ms);
    if (command_complete) {
        let response = command_complete
       // console.log(content_response_list, content_response_list.length, response);
        return await response;
    }
}

async function ScrapeNtbInventory(url) {
    command_complete = await url_req(url=url, data=undefined, method='JGET')
    sleep(tirekingdom_default_sleep_ms);
    if (command_complete) {
        let response = command_complete
        // console.log(content_response_list, content_response_list.length, response);
        return await response;
    }
}


async function GetNtbStores(params) {
    // close browser tabs
    // await close_scrapper_tabs(true);

    const zip_code = params.zip_code;
    const latitude = params.latitude;
    const longitude = params.longitude;
    const req_url = `https://www.ntb.com/rest/model/com/tbc/store/StoreLocatorService/getStoresByLatitudeAndLongitude?q=${await create_random_char_str()}`;
    const url = `https://www.ntb.com/storelocator/search?latitude=${latitude}&longitude=${longitude}&searchkey=${zip_code}`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "ntb.com");
    // make HTTP request and get response data

    headers = {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json;charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
                },
  "referrer": "https://www.ntb.com/storelocator/search",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": JSON.stringify({latitude: latitude, longitude: longitude}),
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
    }
    const response = await fetch(req_url, headers);
    const responseData = await response.json();
    return responseData;
  }


async function GetBigOTiresStores(params) {
    // close browser tabs
    // await close_scrapper_tabs(true);

    const zip_code = params.zip_code;
    const latitude = params.latitude;
    const longitude = params.longitude;
    const req_url = `https://www.bigotires.com/restApi/dp/v1/store/storesByAddress`;
    const url = `https://www.bigotires.com/store-locator/`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "https://www.bigotires.com/store-locator/");
    // make HTTP request and get response data

    headers = {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json;charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-by": "123",
            "x-requested-with": "XMLHttpRequest"
          },
          "referrer": "https://www.bigotires.com/store-locator/",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": JSON.stringify({address: zip_code}),
          "method": "POST",
          "mode": "cors",
          "credentials": "include"
    }
    const response = await fetch(req_url, headers);
    const responseData = await response.json();
    return responseData;
  }





  async function GetTireDiscountersStores(params) {
    // close browser tabs
    // await close_scrapper_tabs(true);

    const zip_code = params.zip_code;
    const req_url = `https://locations.tirediscounters.com/search?q=${zip_code}&qp=${zip_code}&l=en&per=50`;
    const url = `https://locations.tirediscounters.com/`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "tirediscounters");
    // make HTTP request and get response data

    headers = {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
          },
          "referrer": "https://locations.tirediscounters.com/search?q=cincinati+ohio&name=cincinati+ohio",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
    }
    const response = await fetch(req_url, headers);
    const responseData = await response.json();
    return responseData;
  }

async function ScrapePepBoysProduct() {
    command = {action: "method", name: "ScrapePepBoysProduct"}
    command_complete = await send_message_to_content(command);
    if (command_complete) {
        let response = await content_response_list[content_response_list.length -1].response;
        // console.log(content_response_list, content_response_list.length, response);
         return await response;
    }

}

async function GetTireKingdomProduct(sku) {
    var response = await url_req(url = `https://www.tirekingdom.com/rest/model/com/tbc/catalog/CatalogService/getSkuDetails?q=${await create_random_char_str()}`, data = { skuId: sku }, method = 'POST');
    sleep(tirekingdom_default_sleep_ms);
    return await response;
}


async function GetNtbProduct(sku) {
    var response = await url_req(url = `https://www.ntb.com/rest/model/com/tbc/catalog/CatalogService/getSkuDetails?q=${await create_random_char_str()}`, data = { skuId: sku }, method = 'POST');
    sleep(tirekingdom_default_sleep_ms);
    return await response;
}




async function create_random_char_str ()
{   
    let chunk_list = [];
    let random_char_str = '';
    for (let i = 0;  i < 8; i++) {
        random_char_str = (Math.random() + 1).toString(36).substring(8);
        chunk_list.push(random_char_str);
    }
    return chunk_list.join('');


}
async function GetMidasInventoryizes() {

    command = {action: "navigate", url: 'https://www.midas.com/home'}
    await parse_msg(command);

    var width = undefined
    var ratio = undefined
    var diameter = undefined
    var ratio_list = []
    var diameter_list = []
    var tire_size_list = []
    var tire_size = []
    var sleep_interval = 200

    var width_list = await url_req(url='https://www.midas.com/tires/getavailabletirewidths', data=undefined, method='JGET')
    for(var i = 0; i < width_list.length; i++) {
            await sleep(sleep_interval)
            width = width_list[i].idField
            ratio_list = await url_req(url = `https://service.midas.com/services/rest/tiresservices.svc/gettiremeasuresratio?width=${width}`, data = undefined, method = 'JGET')
            await sleep(sleep_interval)
            for (var j = 0; j < ratio_list.length; j++) {
                ratio = ratio_list[j].idField
                diameter_list = await url_req(url = `https://service.midas.com/services/rest/tiresservices.svc/gettiremeasuresdiameter?width=${width}&ratio=${ratio}`, data = undefined, method = 'JGET')
                await sleep(sleep_interval)
                for (var k = 0; k < diameter_list.length; k++) {
                    diameter = diameter_list[k].idField
                    tire_size = [width, ratio, diameter];
                    console.log(tire_size);
                    tire_size_list.push(tire_size);
                };
            };
            // prevent 403
            await sleep(sleep_interval + 300);
        }
        console.log(tire_size_list);
        return tire_size_list;
}

async function GetTireKingdomTireSizes() {

    command = {action: "navigate", url: 'https://www.tirekingdom.com/home'}
    await parse_msg(command);
    
    var width = undefined
    var ratio = undefined
    var diameter = undefined
    var ratio_list = []
    var diameter_list = []
    var tire_size_list = []
    var tire_size = []

    var width_list = await url_req(url='https://www.tirekingdom.com/rest/model/com/tbc/catalog/CatalogService/getTireSizes', data=undefined, method='JGET')
    width_list = await width_list.tireSizes.tireSize
    for(var i = 0; i < width_list.length; i++) {
            await sleep(500)
            width = width_list[i]
            ratio_list = await url_req(url = `https://www.tirekingdom.com/rest/model/com/tbc/catalog/CatalogService/getTireSizes?q=${await create_random_char_str()}`, data = { width: width }, method = 'POST');
            ratio_list = await ratio_list.tireSizes.tireSize;
            await sleep(500)
            for (var j = 0; j < ratio_list.length; j++) {
                ratio = ratio_list[j]
                diameter_list = await url_req(url = `https://www.tirekingdom.com/rest/model/com/tbc/catalog/CatalogService/getTireSizes?q=${await create_random_char_str()}`, data = {width: width, ratio: ratio}, method = 'POST');
                // diameter_list = await fe({width: width, ratio: ratio})
                await sleep(500)

                diameter_list = await diameter_list.tireSizes.tireSize;
                for (var k = 0; k < diameter_list.length; k++) {
                    diameter = diameter_list[k]
                    tire_size = [width, ratio, diameter];
                    console.log(tire_size);
                    tire_size_list.push(tire_size);
                };
            };
            // prevent 403
            await sleep(800);
        }

        return tire_size_list;
}

async function GetBigOTiresTireSizes(existing_list) {
    var url = 'https://www.bigotires.com/home' 
    var tire_size_list = undefined || existing_list || []
    var diameter_set = new Set(tire_size_list.map(x => x[0]))
 
    command = {action: "navigate", url: url}
    max_sleep_interation = 10000;
    await WhereIsClientScript(command, 'bigotires')
    // var response = await SendCommandToContent({action: "method", name: "GetBigOTiresTireSizes"});



    try {
        var width_list = await url_req(url='https://www.bigotires.com/restApi/dp/v1/garage/customTireSizes', data={}, method='BIGOTIRESPOST')
        width_list = await width_list.tireSizes.tireSize
        for(var i = 0; i < width_list.length; i++) {
                let width = undefined
                let ratio = undefined
                let diameter = undefined
                let tire_size = []
                width = width_list[i]
                if (diameter_set.has(width)) {console.log('skipping width'); continue}

                ratio_list = await url_req(url = `https://www.bigotires.com/restApi/dp/v1/garage/customTireSizes`, data = { width: width }, method = 'BIGOTIRESPOST');
                try {ratio_list = await ratio_list.tireSizes.tireSize;}
                // 31.2 width retuns no data for ratio
                catch {continue}
                console.log('ratio:list', ratio_list, 'width:', width)
                await sleep(400)
                for (var j = 0; j < await ratio_list.length; j++) {
                    ratio = ratio_list[j]
                    diameter_list = await url_req(url = `https://www.bigotires.com/restApi/dp/v1/garage/customTireSizes`, data = {width: width, ratio: ratio}, method = 'BIGOTIRESPOST');
                    await sleep(400)

                    diameter_list = await diameter_list.tireSizes.tireSize;
                    for (var k = 0; k < await diameter_list.length; k++) {
                        diameter = diameter_list[k]
                        tire_size = [width, ratio, diameter];
                        console.log(tire_size);
                        tire_size_list.push(tire_size);
                    };
                };
                await sleep(400);

        }
    }
    catch (e) {console.log(e)
        return GetBigOTiresTireSizes(tire_size_list)
    
    }
    return tire_size_list;
}

async function GetNtbTireSizes() {
    
    command = {action: "navigate", url: 'https://www.ntb.com/home'}
    await parse_msg(command);
    
    var width = undefined
    var ratio = undefined
    var diameter = undefined
    var ratio_list = []
    var diameter_list = []
    var tire_size_list = []
    var tire_size = []

    var width_list = await url_req(url='https://www.ntb.com/rest/model/com/tbc/catalog/CatalogService/getTireSizes', data=undefined, method='JGET')
    width_list = await width_list.tireSizes.tireSize
    for(var i = 0; i < width_list.length; i++) {
            await sleep(500)
            width = width_list[i]
            ratio_list = await url_req(url = `https://www.ntb.com/rest/model/com/tbc/catalog/CatalogService/getTireSizes?q=${await create_random_char_str()}`, data = { width: width }, method = 'POST');
            ratio_list = await ratio_list.tireSizes.tireSize;
            await sleep(500)
            for (var j = 0; j < ratio_list.length; j++) {
                ratio = ratio_list[j]
                diameter_list = await url_req(url = `https://www.ntb.com/rest/model/com/tbc/catalog/CatalogService/getTireSizes?q=${await create_random_char_str()}`, data = {width: width, ratio: ratio}, method = 'POST');
                // diameter_list = await fe({width: width, ratio: ratio})
                await sleep(500)

                diameter_list = await diameter_list.tireSizes.tireSize;
                for (var k = 0; k < diameter_list.length; k++) {
                    diameter = diameter_list[k]
                    tire_size = [width, ratio, diameter];
                    console.log(tire_size);
                    tire_size_list.push(tire_size);
                };
            };
            // prevent 403
            await sleep(800);
        }

    return tire_size_list;
}

async function GetGoodYearTireSizes() {

    command = {action: "navigate", url: 'https://www.goodyear.com/'}
    await WhereIsClientScript(command, "goodyear");

    var response = await SendCommandToContent({action: "method", name: "GetTireGoodYearSizes"});

    console.log("Tire Sizes Scraped" , response);
    return response;
}


async function GetMavisTireSizes() {
    max_sleep_interation = 1000
    command = {action: "navigate", url: 'https://www.mavis.com/'}
    await WhereIsClientScript(command, "mavis");
    
    var response = await SendCommandToContent({action: "method", name: "GetTireMavisSizes"});
    
    console.log("Tire Sizes Scraped" , response);
    return response;
}


async function GetMavisStores(params) {
    max_sleep_interation = 1000
    command = {action: "navigate", url: 'https://www.mavis.com/'}
    await WhereIsClientScript(command, "mavis");

    var response = await SendCommandToContent({action: "method", name: "GetMavisStores"});
    debugger
    slug_list = []

    buildId = response.buildId
    states = response.response.pageProps.stores
    state_keys = Object.keys(states)
    for (const state of state_keys) {
        stores = states[state]
        for (const store of stores) {
            slug = store.slug
            slug_list.push(slug)
        }

    }

    final_result = []
    i = 0
//     slug_list = ['atlanta-howell-mill-dr-ga', 'suwanee-peachtree-pkwy-ga'] // testing
    for (var slug of slug_list)
    {
       i += 1
        error = null
        var url = `https://www.mavis.com/_next/data/${buildId}/locations/${slug}.json?slug=${slug}`
        try {
            var response = await fetch(url);
            response = await response.json();
            console.log(slug)
            console.log(i, 'of', slug_list.length)
            final_result.push({'slug':slug, 'storeDetails': response, 'error': error})
        }
        catch (error) {
            final_result.push({'slug':slug, 'storeDetails': response, 'error': error})
            console.log(slug , 'ERROR:', error)

        }
        await sleep(50)



    }
    return final_result;
  }



async function PepBoysRandomWalk(){
    list = [
    // 'https://www.pepboys.com/tires',
    // 'https://www.pepboys.com/auto-service-repair',
    // 'https://www.pepboys.com/',
    // 'https://www.pepboys.com/batteries-accessories/c/19447',
    // 'https://www.pepboys.com/pep-boys-credit-card',
    // 'https://www.pepboys.com/towing-service',
    // 'https://www.pepboys.com/corporate/community'
    'https://www.google.com/url?url=https://www.pepboys.com/tires/1005583%3Fstore_code%3D1823&rct=j&q=&esrc=s&sa=U&ved=0ahUKEwiBlOCH4v_8AhUBI0QIHZvIA3sQgokFCJkKKAA&usg=AOvVaw0mkXAeP_rOFyWYqqzViXUK'
    ]
    list = shuffleArray(list)

    command = {action: "navigate", url: list[0]}
    await parse_msg(command);
    return true
}


async function GetPepboysStores(params) {
    const zip_code = params.zip_code;
    // close browser tabs
    // await close_scrapper_tabs(true);

    const url = `https://www.pepboys.com/stores/?q=${zip_code}`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    // make HTTP request and get response data
    var response = await SendCommandToContent({action: "method", name: "GetPepboysStores", params: params});
    console.log('response', response)

    if (typeof response === 'object' && response !== null && !(response instanceof Array) || response.length > 0 && (response instanceof Array)) {
        return response;
      } else {
        console.log('response is not an object');
        

        throw response;
      }

  }

async function GetWalmartStores(params) {
    const zip_code = params.zip_code;
    // close browser tabs
    // await close_scrapper_tabs(true);

    const url = `https://www.walmart.com/store-finder?location=${zip_code}&services=autoCareCenter`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, 'walmart.com/store-finder?location');
    // make HTTP request and get response data
    var response = await SendCommandToContent({action: "method", name: "GetWalmartStores", params: params});
    console.log('response', response)
    
    await sleep(1000)
    return response

  }

async function GetGoodYearStores(params) {
    const zip_code = params.zip_code;
    // close browser tabs
    // await close_scrapper_tabs(true);

    const url = `https://www.goodyear.com/en_US/stores-find?postalCode=${zip_code}`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    // make HTTP request and get response data
    var response = await SendCommandToContent({action: "method", name: "GetGoodYearStores", params: params});
    console.log('response', response)
    
    return response

  }

async function GetLatLong(params) {
    const accessKey = '0e97db6ca42b4cf91169a316a19766f0'; // address api
    stores = []
    const full_address = params.full_address

    var query = `${full_address}`;

    var req_url = `http://api.positionstack.com/v1/forward?access_key=${accessKey}&query=${encodeURIComponent(query)}`;

    console.log('enriching address for :', full_address);
    try {
        address_enriched = await fetch(req_url);
        address_enriched  = await address_enriched.json();

    } catch (error) {
        console.log('Error:', await address_enriched.text());
        console.error('Error:', error);
    }
    console.log('address_enriched', address_enriched)
    return await address_enriched
    
  }




async function GetPepBoysInventory(params) {
    // ua_test();
    // await PepBoysRandomWalk()
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.pepboys.com/tires/sbs/${width}/${radius}/${diameter}`
    use_proxy = true;

    command = {action: "navigate", url: url}
    await parse_msg(command);
    let response = await ValidatePepboysStoreNum(await GetPepboysStoreNum(), params.store_num);

    if (response === true) {
        console.log("Store Number Validated");
        var response2 = await ScrapePepBoysInventory();
        console.log("Inventory Scraped" , response2);
        // chrome.webRequest.onBeforeSendHeaders.removeListener(rewriteUserAgentHeader);
        return response2;
    }
    else {
        console.log("Store Number Invalid", response, params.store_num);
        error = {response_code : 400,  response: "Store Number Invalid", input : params.store_num, response2: response};

    }
    // chrome.webRequest.onBeforeSendHeaders.removeListener(rewriteUserAgentHeader);
    if (error){return error};



}

async function GetTireKingdomInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.tirekingdom.com/tires/by-size/${width}${radius}${diameter}`
    var inventory_url = `https://www.tirekingdom.com/rest/model/com/tbc/endeca/EndecaService/getTiresBySize?includePath=/browse&Nr=TireSize:${width}${radius}${diameter}`
    use_proxy = true;
    var inventory_exists_bit = undefined;
    command = {action: "navigate", url: url}
    // await parse_msg(command);
    await WhereIsClientScript(command, "tirekingdom");
    let response = await ValidateTireKingdomStoreNum(await GetTireKingdomStoreNum(), params.store_num);

    if (response === true) {
        console.log("Store Number Validated");
        var response2 = await ScrapeTireKingdomInventory(inventory_url);
        if (JSON.stringify(response2).includes('There are no results that match your search')) 
            {inventory_exists_bit = false} 
        else 
            {inventory_exists_bit = true}
        response2.inventory_exists = inventory_exists_bit;
        console.log("Inventory Scraped" , response2);
        return response2;
    }
    else {
        console.log("Store Number Invalid", response, params.store_num);
        error = {response_code : 400,  response: "Store Number Invalid", input : params.store_num, response2: response};
        
    }
    if (error){return error};
}

async function GetBigOTiresInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.bigotires.com/tires/by-size/${width}${radius}${diameter}`
    var inventory_url = `https://www.bigotires.com/restApi/tires/by-size/${width}${radius}${diameter}/?format=json`
    var inventory_exists_bit = undefined;
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, "bigotires.com/tires/by-size/");
    let response = await ValidateBigOTiresStoreNum(await GetBigOTiresStoreNum(inventory_url), params.store_num, 0, inventory_url);

    if (response === true) {
        console.log("Store Number Validated");
        var response2 = await ScrapeBigOTiresInventory(inventory_url);
        if (response2.contents[0].mainContent[1].rightContent[0].totalNumRecs === 0) 
            {inventory_exists_bit = false} 
        else 
            {inventory_exists_bit = true}
        response2.inventory_exists = inventory_exists_bit;
        console.log("Inventory Scraped" , response2);
        return response2;
    }
    else {
        console.log("Store Number Invalid", response, params.store_num);
        error = {response_code : 400,  response: "Store Number Invalid", input : params.store_num, response2: response};
        
    }
    if (error){return error};
}

async function GetNtbInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.ntb.com/tires/by-size/${width}${radius}${diameter}`
    var inventory_url = `https://www.ntb.com/rest/model/com/tbc/endeca/EndecaService/getTiresBySize?includePath=/browse&Nr=TireSize:${width}${radius}${diameter}`
    use_proxy = true;
    var inventory_exists_bit = undefined;
    command = {action: "navigate", url: url}
    // await parse_msg(command);
    await WhereIsClientScript(command, "ntb");
    let response = await ValidateNtbStoreNum(await GetNtbStoreNum(), params.store_num);

    if (response === true) {
        console.log("Store Number Validated");
        var response2 = await ScrapeNtbInventory(inventory_url);
        if (JSON.stringify(response2).includes('There are no results that match your search')) 
            {inventory_exists_bit = false} 
        else 
            {inventory_exists_bit = true}
        response2.inventory_exists = inventory_exists_bit;
        console.log("Inventory Scraped" , response2);
        return response2;
    }
    else {
        console.log("Store Number Invalid", response, params.store_num);
        error = {response_code : 400,  response: "Store Number Invalid", input : params.store_num, response2: response};

    }
    if (error){return error};
}

async function GetAmericanTireDepotInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const store_num = params.store_num
    if (params.store_num === undefined) {throw "Store Number Required"} 

    url = `https://www.americantiredepot.com/tires`
    var inventory_url = `https://www.americantiredepot.com/api/tiresearch/tireresults2019`
    var headers = {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-global-storeno": store_num.toString()
        },
        "referrer": "https://www.americantiredepot.com/tires",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify( {width: width, ratio: radius, rim: diameter, storeNumber: store_num.toString()}),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      }
    var inventory_exists_bit = undefined;
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, "americantiredepot");

    var response = await url_req(inventory_url, null, null, headers);
    if (response == []) 
        {inventory_exists_bit = false} 
    else 
        {inventory_exists_bit = true}
    response.inventory_exists = inventory_exists_bit;
    console.log("Inventory Scraped" , response);
    return response;

}

async function GetGoodYearInventory(params) {
    await remove_browser_data();
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.goodyear.com/en_US/tires?tireFinder=true&prefn1=width&prefv1=${width}&prefn2=aspectRatio&prefv2=${radius}&prefn3=rimDiameter&prefv3=${diameter}&isPLP=true`
    use_proxy = true;
    command = {action: "navigate", url: url}
    // await parse_msg(command);
    await WhereIsClientScript(command, url);
    
    var response = await SendCommandToContent({action: "method", name: "ScrapeGoodYearInventory", params: params});
    
    console.log("Inventory Scraped" , response);
    return response;

}

async function SendCommandToContent(command) {
    id = content_response_list.length
    command_complete = await send_message_to_content(command);
    if (await command_complete) 
    {
        let response = await content_response_list[id].response;
        return await response;
    }
    
}

async function WhereIsClientScript(command, target_domain) {
    var response = false 
    if (!chrome_tab_id) {
        console.log("Tab ID not exists", chrome_tab_id);
        response = await parse_msg(command);
        
    }
    else {
        console.log("Tab ID exists", chrome_tab_id);
        location_info = await SendCommandToContent({action: "method", name: "WhereAmI"});
        console.log('location_info', await location_info);
        if (!location_info.location.includes(target_domain) ) {
            response = await parse_msg(command);
        }
    }
    return response

}

async function GetTireChoiceInventory(params) {
    use_proxy = true;
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const zip_code = params.zip_code
    const store_num = params.store_num

    url = 'https://www.thetirechoice.com/'
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, url);
    var response = await SendCommandToContent({action: "method", name: "GetTireChoiceStore", params: params})
    if (store_num === response) {
        console.log("Store Number Validated");
        var response = await scrape()
        return await response;
    }
    else {
        url = `https://www.thetirechoice.com/appointment/services-info?storeid=${store_num}`
        command = {action: "navigate", url: url}
        await WhereIsClientScript(command, url);
        var response = await scrape()
        return await response;
    
    }
    async function scrape() {
        url = 'https://www.thetirechoice.com/tire-search?ts-method=size&ts-tireBrand=&ts-width=255&ts-ratio=55&ts-size=20'
        command = {action: "navigate", url: url}
        await WhereIsClientScript(command, url);    
        var response = await SendCommandToContent({action: "method", name: "ScrapeTireChoiceInventory", params: params})
        return await response;
    }
}

async function GetMonroInventory(params) {
    use_proxy = true;
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const zip_code = params.zip_code
    const store_num = params.store_num

    url = 'https://www.monro.com/'
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, url);
    var response = await SendCommandToContent({action: "method", name: "GetMonroStore", params: params})
    if (store_num === response) {
        console.log("Store Number Validated");
        var response = await scrape()
        return await response;
    }
    else {
        url = `https://www.monro.com/appointment/services-info?storeid=${store_num}`
        command = {action: "navigate", url: url}
        await WhereIsClientScript(command, url);
        var response = await scrape()
        return await response;
    
    }
    async function scrape() {
        url = 'https://www.monro.com/tire-search?ts-method=size&ts-tireBrand=&ts-width=255&ts-ratio=55&ts-size=20'
        command = {action: "navigate", url: url}
        await WhereIsClientScript(command, url);    
        var response = await SendCommandToContent({action: "method", name: "ScrapeMonroInventory", params: params})
        return await response;
    }
}

async function GetFirestoneInventory(params) {
    await close_scrapper_tabs(true);
    await remove_browser_data();
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.firestonecompleteautocare.com/tires/size/${diameter}-inch/${width}-${radius}-${diameter}`
    use_proxy = true;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "firestone");
    const response = await SendCommandToContent({action: "method", name: "ScrapeFirestoneInventory", params: params})
    return response;
}



async function GetFirestoneStores(params) {
    // close browser tabs
    // await close_scrapper_tabs(true);

    const latitude = params.latitude;
    const longitude = params.longitude;
    const storeCount = 100;
    const url = `https://www.firestonecompleteautocare.com/bsro/services/store/location/get-list-by-lat-lng?latitude=${latitude}&longitude=${longitude}&storeCount=${storeCount}`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "firestonecompleteautocare.com/bsro/services/store/location/get-list-by-lat-lng");
    // make HTTP request and get response data

    headers = {
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
            "wm_page_url": url,
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
        "referrer": url,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
        }

    const response = await fetch(url, headers);
    const responseData = await response.json();
    return responseData;
  }

async function GetTiresPlusStores(params) {
    // close browser tabs
    // await close_scrapper_tabs(true);

    const zip_code = params.zip_code;
    const url = `https://www.tiresplus.com/bsro/services/store/location/get-list-by-zip?zipCode=${zip_code}`;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "tiresplus.com");
    // make HTTP request and get response data

    headers = {
        "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-dtpc": "2$59793727_742h21vFRJKQCWSMDVKFIHQUOFPPVCKCBOOULTC-0e0",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "https://www.tiresplus.com/locate/display-map/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      }

    const response = await fetch(url, headers);
    const responseData = await response.json();
    return responseData;
  }

async function GetBelleTireInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const store_num = params.store_num
    max_sleep_interation = 50
    price_region = _getBelletirePriceRegion(store_num)
    params['price_region'] = price_region
    
    url = `https://www.belletire.com/tire-size/${width}/${radius}/${diameter}/results`
    console.log('STEP 2. Url = ',  url);
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, 'belletire.com');
    var results = await SendCommandToContent({action: "method", name: "GetBelleTireInventory", params:params});
    return results


    // internal func
    function _getBelletirePriceRegion (store_num) {switch (store_num) {
        case 142: return 'IN';
        case '142': return 'IN';
        case 51: return 'GR';
        case '51': return 'GR';
        case 3: return 'RM';
        case '3': return 'RM';
        case 167: return 'CH';
        case '167': return 'CH';
        default: throw {
            error: "PriceRegion not found for store_num = " + store_num, store_num: store_num};
        }
    }
}    

async function GetTireDiscountersStoreNum() {
    command = {action: "method", name: "GetTireDiscountersStoreNum"}
    command_complete = await send_message_to_content(command);
    if (command_complete) {
    
        let current_store_num = await content_response_list[content_response_list.length -1].response;
        return await current_store_num;}
    
    }

async function ValidateTireDiscountersStoreNum(current_store_num, expected_store_num, iteration = 0, zip_code) {
    method = "TIREDISCOUNTERS"
    body = undefined
    

    if (current_store_num === undefined) {current_store_num = await GetTireDiscountersStoreNum();}

    body_params ={
        "storeId": expected_store_num.toString(),
        "market": "10",
        "name": "Winford ByPass",
        "addressLine1": "6578 Winford Ave",
        "city": "Hamilton",
        "state": "OH",
        "zip": "45011",
        "country": "US",
        "lat": 39.39143921553854,
        "lng": -84.50890123844152,
        "storeLink": "https://locations.tirediscounters.com/oh/hamilton-6578-winford-ave",
        "phone": "+15138448600",
        "phoneVisual": "(513) 844-8600",
        "phoneAccessible": "5 1 3. 8 4 4. 8 6 0 0",
        "distanceInMiles": 2.6438726582444656,
        "storeHours": {
            "monday": {
                "isClosed": false,
                "opensAt": "08:00",
                "closesAt": "18:00"
            },
            "tuesday": {
                "isClosed": false,
                "opensAt": "08:00",
                "closesAt": "18:00"
            },
            "wednesday": {
                "isClosed": false,
                "opensAt": "08:00",
                "closesAt": "18:00"
            },
            "thursday": {
                "isClosed": false,
                "opensAt": "08:00",
                "closesAt": "18:00"
            },
            "friday": {
                "isClosed": false,
                "opensAt": "08:00",
                "closesAt": "18:00"
            },
            "saturday": {
                "isClosed": false,
                "opensAt": "08:00",
                "closesAt": "16:00"
            },
            "sunday": {
                "isClosed": true,
                "opensAt": null,
                "closesAt": null
            },
            "holidays": [
                {
                    "date": "2022-12-24",
                    "isClosed": true
                }
            ]
        }
    } 
     
    console.log('Validate Tire Discounters store num', current_store_num, expected_store_num, iteration, zip_code);
    end_point = `https://tirediscounters.com/api/store-information/v2/select-store`
    body = JSON.stringify(body_params)

    if (current_store_num == expected_store_num) {
        return true;
    }
    else {
        console.log({current_store_num: current_store_num, expected_store_num: expected_store_num});
        if (iteration === 0) {
            await url_req(end_point, body, method)
            console.log("refreshing tabid", chrome_tab_id);
            await reload_tab(chrome_tab_id);
            return await ValidateTireDiscountersStoreNum(await GetTireDiscountersStoreNum(), expected_store_num, iteration + 1, zip_code);
        }
        else {console.log({current_store_num: current_store_num, expected_store_num: expected_store_num}); throw `could not set store num {current_store_num: ${current_store_num}, expected_store_num: ${expected_store_num}}`;}
    }
}

async function GetTireDiscountersInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const store_num = params.store_num
    max_sleep_interation = 50
    
    // STEP 1
    var page_num = 1 
    var tires_list = []
    url = `https://tirediscounters.com/finder/results?searchMethod=searchBySize&tireWidth=${width}&aspectRatio=${radius}&rimSize=${diameter}&page=1`
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, url);
    await ValidateTireDiscountersStoreNum(await GetTireDiscountersStoreNum(), store_num, 0, params.zip_code)
    var response = await SendCommandToContent({action: "method", name: "ScrapeTireDiscountersInventory", params: params})
    if (response === undefined) {throw "No Response"}
    if (JSON.stringify(response).includes("no-results-found")) {return "no-results-found"}
    else {
        totalResults = response.searchResults.totalResults
        if (totalResults > 10) 
        {
            page_num = ~~(totalResults / 10)
            if (totalResults % 10 > 0) {page_num++}
            tires_list.push(response.searchResults.products)
            for (var i = 2; i <= page_num; i++) {
                url = `https://tirediscounters.com/finder/results?searchMethod=searchBySize&tireWidth=${width}&aspectRatio=${radius}&rimSize=${diameter}&page=${i}`
                command = {action: "navigate", url: url}
                await WhereIsClientScript(command, url);
                var response = await SendCommandToContent({action: "method", name: "ScrapeTireDiscountersInventory", params: params})
                tires_list.push(response.searchResults.products)
            }

        }
        else {tires_list.push(response.searchResults.products)}

    }
    tires_list = tires_list.flat(1)
    console.log("Inventory Scraped" , tires_list);
    return await tires_list;
}    


async function GetFirestoneProductDetails(params) {
    await close_scrapper_tabs(true);
    await remove_browser_data();
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.firestonecompleteautocare.com/tires/size/${diameter}-inch/${width}-${radius}-${diameter}`
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    const response = await SendCommandToContent({action: "method", name: "ScrapeFirestoneProductDetails", params: params})
    return response;
}

async function GetMavisInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const zip_code = params.zip_code.toString()
    const store_num = params.store_num.toString()
    max_sleep_interation = 400; // mavis likes to drop messages shorten this to increase resend events 
    

    if (params.store_num === undefined) { throw "Store Number Required"} 
    if (params.zip_code === undefined) { throw "Zip code Required"}

    url = `https://www.mavis.com/`
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    response = await SendCommandToContent({action: "method", name: "ScrapeMavisInventory", params: params})
    return await response;
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


async function GetWalmartInventory(params) {
    // await remove_browser_data()
    if (params.store_num === undefined) { throw "Store Number Required"} 
    if (params.zip_code === undefined) { throw "Zip code Required"}
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter

    fitmentFieldParams = {
        "fitmentFields": [
            {
                "id": "tireWidth",
                "value": width,
                "label": width
            },
            {
                "id": "tireRatio",
                "value": radius,
                "label": radius
            },
            {
                "id": "tireDiameter",
                "value": diameter,
                "label": diameter
            }
        ],
        "formId": "findByTireSize",
        "partTypeIDs": [
            "7636"
        ],
        "powerSportEnabled": true
    }

     url = `https://www.walmart.com/search?q=tires&facet=tire_width%3A${width}%7C%7Ctire_aspect_ratio%3A${radius}%7C%7Ctire_diameter_tires_general%3A${diameter}%22`
    //  let url_params = new URLSearchParams('tires&facet=tire_width%3A235%7C%7Ctire_aspect_ratio%3A55.0%7C%7Ctire_diameter_tires_general%3A18%22');
    //  url_params.set('fitmentFieldParams', JSON.stringify(fitmentFieldParams)); 
    //  url = url + url_params.toString();

    use_proxy = true;
    command = {action: "navigate", url: url}
    // command = {action: "navigate", url: 'https://walmart.com'}

    await WhereIsClientScript(command, "walmart.com");
    await ValidateWalmartStoreNum(await GetWalmartStoreNum(), params.store_num, 0, params.zip_code);

    var response = await SendCommandToContent({action: "method", name: "ScrapeWalmartInventory", params: params})
    console.log("Inventory Scraped" , response);
    return await response;
}
async function GetCostcoInventory(params) {
    // await remove_browser_data()
    const width = params.width
    var radius = params.radius
    var diameter = params.diameter
    const store_num = params.store_num
    const zip_code = params.zip_code
    if (radius.toString().includes(".5")) {radius = radius.toFixed(2)}
    if (diameter.toString().includes(".5")) {diameter = diameter.toFixed(2)}

    params.radius = radius
    params.diameter = diameter

    if (store_num === undefined) { throw "Store Number Required"} 
    if (zip_code === undefined) { throw "Zip code Required"} 


     url = `https://tires.costco.com/`

    use_proxy = true;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    response = await ValidateCostcoStoreNum(await GetCostcoStoreNum(), params.store_num, 0, params.zip_code)
    console.log("Store Num Validated");
    if (response === true){
        var login = await SendCommandToContent({action: "method", name: "LoginCosco", params: {email: 'tshaffer14@gmail.com', pass: 'Llcshaffer14!'}})
        // call again to get around content script reload after click on login
        login = await SendCommandToContent({action: "method", name: "LoginCosco", params: {email: 'tshaffer14@gmail.com', pass: 'Llcshaffer14!'}})
        // call again to get around content script reload after login
        login = await SendCommandToContent({action: "method", name: "LoginCosco", params: {email: 'tshaffer14@gmail.com', pass: 'Llcshaffer14!'}})
        console.log("Login Complete", {response: login});
    }
    else 
    {
        throw {message: "Failed to set store num", response: response, params: params}
    }
    if (await login || content_script_location.includes('Home')) {
        await sleep(1000)
        var i = 0;
        console.log(content_script_location, 'content_script_location', content_script_location.includes('Home'));
        while (content_script_location.includes('Home') === false && login === undefined) {
            console.log("Waiting for redirect to home page");
            await sleep(1000);
            i++;
            if (i > 10) {
                throw "Failed to navigate to home page"
            }
        }

        await sleep(1000)
        response = await SendCommandToContent({action: "method", name: "SelectCostcoTireSize", params: params})
        
        if (await response === true) {
            url = `https://tires.costco.com/SearchResultsBySize?Width=${width}&Aspect=${radius}&Rim=${diameter}`
            // command = {action: "navigate", url: url}

            // await WhereIsClientScript(command, url);
            var i = 0;
            while (content_script_location !== url) {
                console.log("Waiting for redirect to tire page");
                await sleep(1000);
                i++;
                if (i > 10) {
                    throw "Failed to navigate to tire page"
                }

            }
            var inventory = await SendCommandToContent({action: "method", name: "ScrapeCostcoInventory", params: params})
            return await inventory;
        }
        else {throw {message: "Failed to select tire size", response: response, params: params}}
    }
    else {
        throw {message: "Failed to login", response: login, params: params}
    }
}

async function GetTiresPlusInventory(params) {
    await close_scrapper_tabs(true);
    await remove_browser_data();

    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.tiresplus.com/tires/size/${diameter}-inch/${width}-${radius}-${diameter}`
    use_proxy = true;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "tiresplus");
    var response = await SendCommandToContent({action: "method", name: "ScrapeTiresPlusInventory", params: params})
    return response;
}


async function GetTiresPlusProductDetails(params) {
    await close_scrapper_tabs(true);
    await remove_browser_data();
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    url = `https://www.tiresplus.com/tires/size/${diameter}-inch/${width}-${radius}-${diameter}`
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    const response = await SendCommandToContent({action: "method", name: "ScrapeTiresPlusProductDetails", params: params})
    return response;
}

async function GetTireDiscountTireSizes() {
    url = `https://www.discounttire.com/`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;

    await WhereIsClientScript(command, "discounttire");
    max_sleep_interation = 200;
    const response = await SendCommandToContent({action: "method", name: "GetTireDiscountTireSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireDiscountersTireSizes() {
    url = `https://tirediscounters.com/finder/size`
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;

    await WhereIsClientScript(command, url);
    max_sleep_interation = 50000;
    const response = await SendCommandToContent({action: "method", name: "GetTireDiscountersTireSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireAmericasTireSizes() {
    url = `https://www.americastire.com/#/fitment/tire`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;
    
    await WhereIsClientScript(command, "americastire");
    max_sleep_interation = 200;
    const response = await SendCommandToContent({action: "method", name: "GetTireAmericasTireSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireAmericanTireDepotSizes() {
    url = `https://www.americantiredepot.com/`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;
    
    await WhereIsClientScript(command, "americantiredepot");
    max_sleep_interation = 5000;
    const response = await SendCommandToContent({action: "method", name: "GetTireAmericanTireDepotSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireCostcoSizes() {
    url = `https://tires.costco.com/`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;
    
    await WhereIsClientScript(command, "tires.costco");
    max_sleep_interation = 200;
    const response = await SendCommandToContent({action: "method", name: "GetTireCostcoSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireFirestoneSizes() {
    url = `https://www.firestonecompleteautocare.com/tires`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;
    
    await WhereIsClientScript(command, "firestone");
    max_sleep_interation = 200;
    const response = await SendCommandToContent({action: "method", name: "GetTireFirestoneSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireWalmartSizes(existing_list) {
    url = `https://www.walmart.com/search?q=tires&cat_id=91083`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;
    
    await WhereIsClientScript(command, "walmart");
    max_sleep_interation = 20000;
    const response = await SendCommandToContent({action: "method", name: "GetTireWalmartSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}

async function GetTireTiresPlusSizes() {
    url = `https://www.tiresplus.com/tires`
    use_proxy = true;
    command = {action: "navigate", url: url}
    original_max_sleep_interation = max_sleep_interation;
    
    await WhereIsClientScript(command, "tiresplus");
    max_sleep_interation = 200;
    const response = await SendCommandToContent({action: "method", name: "GetTireTiresPlusSizes"})
    max_sleep_interation = original_max_sleep_interation;
    return response;
}



async function GetDiscountTireInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    var inventory_exists_bit = undefined;

    var extra_params = params.extra_params
    if (extra_params != undefined) {
        extra_params = JSON.parse(extra_params)
        const model_id = extra_params.model_id
        const sub_sku = extra_params.sub_sku
        var url = extra_params.url
        const sku_key = params.sku_key
    
    }

    if (url === undefined){
        url = `https://www.discounttire.com/fitmentresult/tires/size/${width}-${radius}-${diameter}` 
    }

    use_proxy = true;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "discounttire");
    const response = await SendCommandToContent({action: "method", name: "ScrapeDiscountTireInventory", params: params})
    
    try { error =  response.errors[0].extensions.classification
        return response;
        
    }
    catch (e){
    }

    try {

        var exists = response.data.product || response.data.productSearch.tireSize.pagination.totalNumberOfResults  
    if (exists) 
        { inventory_exists_bit = true; } 
    else 
        { inventory_exists_bit = false; }
    }
    catch (e) { return {response: response, error:e} }
    response.inventory_exists = inventory_exists_bit;
    return response;
}

async function GetDiscountTireStores(params) {
    const zip_code = params.zip_code
    max_sleep_interation = 1000;

    let url = `https://www.discounttire.com/store-locator` 

    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "store-locator");
    const response = await SendCommandToContent({action: "method", name: "GetDiscountTireStores", params: params})

    return response;
}

async function GetTireChoiceStores(params) {
    let url = `https://www.thetirechoice.com/store-search/?q=34689&redirect=%2F` 

    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, "thetirechoice.com");

    const response = await SendCommandToContent({action: "method", name: "GetTireChoiceStores", params: params})

    return response;
}

async function GetAmericasTireInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const store_num = params.store_num
    var inventory_exists_bit = undefined;
    url = `https://www.americastire.com/fitmentresult/tires/size/${width}-${radius}-${diameter}?storeCode=${store_num}`
    use_proxy = true;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, "americastire");
    const response = await SendCommandToContent({action: "method", name: "ScrapeAmericasTireInventory", params: params})
    try {
    if (response.data.productSearch.tireSize.pagination.totalNumberOfResults == 0) 
        { inventory_exists_bit = false; } 
    else 
        { inventory_exists_bit = true; }
    }
    catch (e) { return {response: response, error:e} }
    response.inventory_exists = inventory_exists_bit;
    return response;
}

async function GetReviews(params) {
    const retailer_key = params.retailer_key
    const review_location = params.review_location

    const command = {action: "navigate", url: review_location}
    await WhereIsClientScript(command, review_location);

    if (retailer_key === 'TIRERACK'){
        max_sleep_interation = 6000
        var response = await SendCommandToContent({action: "method", name: "ScrapeTireRackReviews", params: params})
        await decodeComments(response)
        await sleep(100)
        max_sleep_interation = 20


    }

    return response;

}

async function decodeComments(data) {
    if (Array.isArray(data)) {
        for (const item of data) {
            await decodeComments(item);
        }
    } else if (typeof data === 'object' && data !== null) {
        for (let key in data) {
            if (key === 'additionalComments' && typeof data[key] === 'string') {
                data[key] = decodeHtmlEntities(decodeURIComponent(data[key].replace(/\+/g, ' ')));
            } else {
                await decodeComments(data[key]);
            }
        }
    }
    return data;
}

function decodeHtmlEntities(text) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

async function GetTireRackInventory(params) {
    const width = params.width
    const radius = params.radius
    const diameter = params.diameter
    const zip_code = params.zip_code
    var inventory_exists_bit = undefined;

    url = `https://www.tirerack.com/tires/TireSearchResults.jsp?zip-code=${zip_code}&width=${width}/&ratio=${radius}&diameter=${diameter}&rearWidth=${width}/&rearRatio=${radius}&rearDiameter=${diameter}&performance=ALL`
    use_proxy = true;
    command = {action: "navigate", url: url}

    await WhereIsClientScript(command, url);
    var response = await SendCommandToContent({action: "method", name: "ScrapeTireRackInventory", params: params})

    if (response.toString().includes('no tires')) 
        { inventory_exists_bit = false; } 
    else 
        { inventory_exists_bit = true; }
        
    response = {inventory_exists: inventory_exists_bit, inventory: response}
    return response;
}


async function GetPepBoysProductDetails(params) {
    url = params.link
    use_proxy = true;

    command = {action: "navigate", url: url}
    await parse_msg(command);
    let response = await ScrapePepBoysProduct();

    if (await response) {
        console.log("Product Scraped" , response);
        return response;
    }
    else {
        console.log("ERROR link Invalid or no response from content", response, params);
        error = {response_code : 400,  response: "something went wrong", input : params};
    }
    if (error){return error};



}


async function GetTireKingdomProductDetails(params) {
    url = params.link
    use_proxy = true;
    sleep(tirekingdom_default_sleep_ms)

    // command = {action: "navigate", url: url}
    // await parse_msg(command);
    let response = await GetTireKingdomProduct(params.sku);

    if (await response) {
        console.log("Product Scraped" , response);
        return await response;
    }
    else {
        console.log("ERROR link Invalid or no response from content", response, params);
        error = {response_code : 400,  response: "something went wrong", input : params};
    }
    if (error){return error};



}

async function GetNtbProductDetails(params) {
    url = params.link
    use_proxy = true;
    sleep(tirekingdom_default_sleep_ms)

    let response = await GetNtbProduct(params.sku);

    if (await response) {
        console.log("Product Scraped" , response);
        return await response;
    }
    else {
        console.log("ERROR link Invalid or no response from content", response, params);
        error = {response_code : 400,  response: "something went wrong", input : params};
    }
    if (error){return error};

}

async function GetWalmartProductDetails(params) {
    const url = `https://www.walmart.com${params.link}`

    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, url);
    
    var response = await SendCommandToContent({action: "method", name: "ScrapeWalmartProductDetails"});
    
    console.log("Tire Details Scraped" , response);
    return response;


}

async function ClearAllCookies() {
    send_message_to_content({action: "method", name: "ClearAllCookies"});
}


async function sleep_counter(name, length) {
    while (sleep_counter < max_sleep_interation) {
        console.log(name, 'is sleeping', sleep_counter);
        await sleep(1000);

        sleep_counter++;
    }
    
}

async function close_scrapper_tabs(close_all=false) {
    try {
    await chrome.tabs.query({}, function (tabs) {
        console.log('number of tabs', tabs.length)
        if (tabs.length > 6) {
            console.log('open_tabs', tabs);
            chrome_tab_id = undefined
            tabs.slice(1, tabs.length -1).forEach(tab => {
                chrome.tabs.remove(tab.id);
                console.log('tab_closed', tab);

            });
         
        }
        if (close_all === true) {
            tabs.slice(1, tabs.length).forEach(tab => {
                console.log('tab_closed', tab);
                chrome.tabs.remove(tab.id);
    
            });
            chrome_tab_id = undefined
    


        }
    });}
    catch {return true}
    await sleep(100);
    return true

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }


  async function main() {
    try {
        port = chrome.runtime.onConnect.addListener(on_response)
        
    } catch (error) {
        console.log('error', error);
        await sleep(1000);
        await restart_chrome();        
    }
    await remove_browser_data();
    console.log('current time = ',  GetCurrentTimeStr());
    // await close_scrapper_tabs(true);
    await sleep(5000);
    if (var_websocket_url.includes('localhost')) {
        console.log('localhost test');
    }
    else {
        console.log('stagger_start for', random_wait/1000, 'seconds');
        await sleep(random_wait);
    }
    try {
        ws = new WebSocket(var_websocket_url);
    } catch (error) {
        console.log('error', error);
        restart_chrome()        
    }
    ready_msg = "ac1114d771649840a01419c224e4174393653fbbc73385c1d473c52a3c1b43f9" // "ready"
    ws.onopen = function () {
        
        ws.send(ready_msg);
        console.log('ready')
    };


    ws.onmessage = async function (msg) {
        const r_msg = JSON.parse(msg.data);
        console.log("Message is received:", r_msg);
        let result = await parse_msg(r_msg);
        result = {request: r_msg, response: result};
        await close_scrapper_tabs();
        await send_response_to_backend(result);
        await ws.send(ready_msg);

    };
    console.log("main complete");
    use_proxy = false;
}

async function stuck_check(){

    while (true) {
        if (await ws === undefined ) {
            try {
                port = chrome.runtime.onConnect.addListener(on_response)

            } catch (error) {
                console.log('error', error);
                await sleep(1000);
                await restart_chrome();
            }
            try {
                ws = new WebSocket(var_websocket_url);
            } catch (error) {
                console.log('error', error);
                restart_chrome();
            }
        }
        else if (await ws.readyState === 3) {
            try {
                ws = new WebSocket(var_websocket_url);
            } catch (error) {
                console.log('error', error);
                restart_chrome();
            }

        }


        else if (last_message_sent_to_backend_time === undefined){
            await sleep(2000);
            continue;
        }
        else {
            var startDate = last_message_sent_to_backend_time
            var endDate   = new Date();
            var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
            console.log('stuck check', seconds);
            await sleep(20000)
            if (seconds > 60*3) {
                ws.send(ready_msg);
                if (seconds > (60*6) )
                {   console.log('stuck check', seconds);
                    restart_chrome();

                }
            }
        }

    }

}

async function test_call() {
    port = chrome.runtime.onConnect.addListener(on_response)
    // request = {"action": "method", "name": "GetPepBoysInventory", "retailer_code": "PEPBOYS", "request_type": "GetInventory", "args": {"store_num": "0049", "width": "235", "radius": "45", "diameter": "19"}, "request_id": 910102}
    // args = request.args
    // ws = new WebSocket("ws://localhost:8087/");
    // x =  await GetPepBoysInventory(args)
    // // await remove_browser_data();
    // // await sleep(2000);
    // // max_sleep_interation = 100000;
    // ws.send(JSON.stringify({request: request, response: x, response_code: 200}));
    // x = await GetBelletireStores({zip_code:48001})
    // remove_browser_data();
    // ws.send(JSON.stringify({file_name: "tiresize.json", result:'test'}));

    // params = {zip_code: 33713};
    // x = await GetWalmartStores(params)
    // console.log(x);
    // --------------------------------- TIREDISCOUNTERS ----------------------------
    // request = {
    //     "action": "method", "name": "GetTireDiscountersInventory", "retailer_code": 'TIREDISCOUNTERS',
    //     "request_type" : 'GetInventory' ,
    //     "args": {"width": 205, "radius": 70, "diameter": 14, "zip_code": 45011, "store_num": 34}
    // };

    // console.log(request)
    // var final_response = await GetTireDiscountersInventory(request.args);
    // var final_response = await GetMidasInventoryizes();
    // Example usage:
    // GetMidasStores({ zip_code: "33705" }).then(console.log).catch(console.error);
//         const tireParams = {
//             width: 255,
//             radius: 55,
//             diameter: 19,
//             storeNo: 3174
//         };
//
//         GetMidasInventory(tireParams)
//             .then(data => console.log(data))
//             .catch(error => console.error(error));

    // console.log("=====================");
    // console.log('final_response = ', final_response)
    // ws.send(JSON.stringify({file_name: "GetMidasInventoryizes.json", result: await final_response}));
    // -------------------------------------------------------------------------

    // // --------------------------------- BELLETIRE ----------------------------
    request = {
        "action": "method", "name": "GetBelleTireInventory", "retailer_code": 'BELLETIRE', 
        "request_type" : 'GetInventory' , 
        "args": {"width": 225, "radius": 65, "diameter": 17, "zip_code": 43001, "store_num": 142}
    };

    console.log(request)
    var final_response = await GetBelleTireInventory(request.args);
    console.log("=====================");
    console.log('final_response = ', final_response)
    ws.send(JSON.stringify({file_name: "BELLETIRE.json", result: await final_response}));
    // // -------------------------------------------------------------------------

    // --------------------------------- BIGOTIRES ----------------------------
    // request = {
    //     "action": "method", "name": "GetBigOTiresInventory", "retailer_code": 'BIGOTIRES', 
    //     "request_type" : 'get' , 
    //     "args": {"width": 255, "radius": 60, "diameter": 20, "zip_code": 73034, "store_num": 171}
    // };
    // console.log(request)
    // var final_response = await GetBigOTiresInventory(request.args);
    // console.log(final_response)
    // ws.send(JSON.stringify({file_name: "BIGOTIRES.json", result: await final_response}));
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // var final_response = await GetGoodYearInventory({width: 255, radius: 50, diameter: 20});
    // var final_response = await GetGoodYearTireSizes();
    // var final_response = await GetTireWalmartSizes({width: 255, radius: 55, diameter: 18, store_num: 630047});
    // url = `https://www.walmart.com/`
    // command = {action: "navigate", url: url}
    // await WhereIsClientScript(command, "walmart");
//     request = {"action": "method", "name": "GetPepBoysInventory", "retailer_code": "PEPBOYS", "request_type": "GetInventory", "args": {"store_num": "0157", "width": "37", "radius": "13.5", "diameter": "22"}, "request_id": 3409}
    // var final_response = await GetPepBoysInventory(request.args);
    console.log("test_call complete");
}



async function GetBelletireStores(params) {
    await sleep(1000)
    max_sleep_interation = 50
    const zip_code = params.zip_code

    // STEP 1
    console.log("==============================================================================")
    console.log('current time = ',  GetCurrentTimeStr());
    url = `https://www.belletire.com/stores`
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, url);
    const set_belletire_store_result = await SendCommandToContent({action: "method", name: "SetBelletireStoreZip", params: params})
    console.log(set_belletire_store_result)

    // STEP 2
    console.log("==============================================  STEP 2: Get hash")
    // template = url = 'https://www.belletire.com/tire-size/225/65/17/results'
    url = `https://www.belletire.com/stores`
    console.log('STEP 2. Url = ',  url);
    command = {action: "navigate", url: url}
    await WhereIsClientScript(command, url);
    var hash_list = await SendCommandToContent({action: "method", name: "GetBelletireHash", params:{searchElement: "FIND_STORES_BY_ZIP" }});
    console.log('hash_list = ',  hash_list);
    hash = 'EMPTY!!!' // '2dWW4TTFQynp7e+8aE9N2EXKkxXrWwkqyb0niGg921k='
    if (hash_list.length > 0 )
    {
        hash = hash_list[0]['auth_hash'];
    }
    console.log('!!!!!  HASH = ',  hash);

    // STEP 3
    url = `https://www.belletire.com/api/graphql`
    if (hash != 'EMPTY!!!')
    {
        body = `"{\\"query\\":\\"\\\\n          query FIND_STORES_BY_ZIP {\\\\n            zipcodeStores(zipcode: \\\\\\"${zip_code}\\\\\\"){\\\\n              Id\\\\n              Name\\\\n              Address\\\\n              City\\\\n              State\\\\n              ZipCode\\\\n              CityStateZip\\\\n              PriceRegion\\\\n              Phone\\\\n              Distance\\\\n              ManagerImage {\\\\n                type\\\\n                url\\\\n              }\\\\n              ManagerName\\\\n              ManagerTitle\\\\n              ManagerYearsOfService\\\\n              Location {\\\\n                Latitude\\\\n                Longitude\\\\n              }\\\\n              StoreHours {\\\\n                Day\\\\n                Opens\\\\n                Closes\\\\n              }\\\\n            }\\\\n          }\\\\n        \\"}"`
        body = JSON.parse(body)
        // body =
        response = await url_req(url=url, data= { body : body, hash : hash}, method='BelleTireStores')
        if (response) {
            return await response;
        }
    }
    else
    {
        return {"result": "Store hash not found!"}
    }

}




function GetCurrentTimeStr() {
    dt = new Date();
    return dt.toLocaleTimeString() + '.' + dt.getMilliseconds()
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// -------------------------------------------------------------------------
// ENTRY POINT
// -------------------------------------------------------------------------
try {
    main();
    stuck_check();
    // test_call();

    
} catch (error) {
    console.log('!!!ERROR: ', error);
    restart_chrome()
}

// test_call()

// magic key 0e97db6ca42b4cf91169a316a19766f0