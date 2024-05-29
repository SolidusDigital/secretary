const ProxyChain = require('proxy-chain');
const fs = require('fs')

const config = {
    PORT: parseInt(process.env.NODE_PORT) || 9000,
    MAX_REQUESTS: parseInt(process.env.NODE_REQUESTS_PER_PROXY) || 300,
    MAX_TIME: parseInt(process.env.NODE_MAX_TIME) || 180,
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

console.log('Config', config)

var proxyList = fs.readFileSync(__dirname + '/proxylist.txt', 'utf-8')
    .split('\n')
    .map(line => line.trim())

proxyList = shuffleArray(proxyList)
proxyList = proxyList.filter(item => item)
console.log('proxy list:', proxyList)

//proxy change logic
let requestCounter = 0;
let proxyIndex = 0;
let lastSwitch = Date.now()

east_coast_p = [
'http://8gTmsH5thQUxpkE:SsuOKtaOOUuTupf@107.180.129.150:49302',
'http://ud9M8VXRskQixXs:ugNyoKCuhYCrnwr@107.180.129.160:49618',
'http://glsR3oVT3yKWpFc:v6s7fom9RHKB4BN@107.180.129.86:47536',
'http://rdfJcehZp8zR8vT:aKvzDLo8nHgpFW2@107.180.130.215:44874',
'http://n2iUctNhuhQNoWD:SXn8NhvABKTudeH@107.180.131.230:42044',
'http://LoDCGuPc0wNysId:iSR6cyh5jqyALLy@107.180.131.56:43744',
'http://17O6gQ1CucTyLSW:iYMcI2BlMmn93mg@107.180.132.108:49700',
'http://6UqYv9hytR6GCSJ:HYlBBUvOT3fRDl9@107.180.132.89:44043',
'http://sRgzTwtxf6jVcPF:ikzN17mtIbRjRRE@107.180.133.103:44913',
'http://3nLGRKImt3McjPO:BCJJ4m70Qr50XJr@107.180.133.105:43384',
'http://xvwwjfkt:anxol6tlixnh@107.180.181.208:5588'
]
east_coast_p = shuffleArray(east_coast_p)[0]

function getProxy() {
    requestCounter++
    if (
        (requestCounter >= config.MAX_REQUESTS)
        || (Date.now() - lastSwitch > config.MAX_TIME * 1000)
    ) {
        // console.log('Change proxy to', proxyList[proxyIndex], 'after', requestCounter, 'requests and ', (Date.now() - lastSwitch) / 1000, ' seconds')

        requestCounter = 0
        proxyIndex++
        if (proxyIndex >= proxyList.length) {
            proxyIndex = 0
        }
        lastSwitch = Date.now()
    }
    // console.log('Using proxy', proxyList[proxyIndex])
    return proxyList[proxyIndex]
}

function getProxy2() {
    requestCounter++
    if (
        (requestCounter >= config.MAX_REQUESTS)
        || (Date.now() - lastSwitch > config.MAX_TIME * 1000)
    ) {
        
        requestCounter = 0
        proxyIndex++
        if (proxyIndex >= east_coast_p.length) {
            proxyIndex = 0
        }
        lastSwitch = Date.now()
    }
    // console.log('Using proxy', east_coast_p[proxyIndex])
    return east_coast_p[proxyIndex]
}

//proxy logic
const server = new ProxyChain.Server({
    port: config.PORT,

    verbose: false,

    prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
        // console.log(`Request ${request.url} received`);
        // console.log(`Request ${connectionId} received`);
        // console.log(`Request ${hostname} received`);
        // if (request.url === ' www.pepboys.com:443'){
        //     proxy = getProxy2()
        // }
        // else {
        //     proxy = getProxy()
        // }
        proxy = getProxy()
        return {
            requestAuthentication: false,
            upstreamProxyUrl: proxy,
            failMsg: 'Bad username or password, please try again.',
        };
    },
});

server.listen(() => {
    console.log(`Proxy server is listening on port ${server.port}`);
});


server.on('requestFailed', ({ request, error }) => {
    console.log(`Request ${request.url} failed`);
    console.error(error);
});
