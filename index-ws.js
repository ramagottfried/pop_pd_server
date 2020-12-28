
'use strict';

const http_port = 5001;
const udp_input_port = 8888;

const pd_port = 7777;
const reaper_port = 8000;

const http  = require('http');
const express = require('express');
const socketio = require('socket.io');

const WebSocket = require('ws');

const dgram = require('dgram');
const { obj2osc, osc2obj } = require('./o');


const app = express();
app.use(express.static(__dirname));

const server = http.createServer(app);

// setup sockets
const wss = new WebSocket.Server({
    server: server
});

wss.setMaxListeners(200);

// pretty sure this is never called
wss.on("close", function (socket, req) {
    const uniqueid = req.headers['sec-websocket-key'];
    const _url = req.url;

    console.log('received wss socket close', _url, uniqueid);
    
    socket.terminate();
    
});


// create OSC websockets from vanilla websockts, and add to clients list
wss.on("connection", function (socket, req) {

    const uniqueid = req.headers['sec-websocket-key'];
    const _url = req.url;
    const _ip = req.connection.remoteAddress;

    const clientInfo = {
        url: _url,
        ip: _ip,
        uniqueid: uniqueid
    }

    const disconnectionMsg = {
        event: {
            from: clientInfo,
            key: 'status',
            val: {
                connected: 0
            }
        }
    };
    

//        Max.post("A Web Socket connection has been established! " + req.url + " (" + uniqueid + ") " + req.connection.remoteAddress);

    socket.on("disconnect", () => {
        console.log(`ciao! ${socket}`);
    });

    // setup relay back to Max
    socket.on("message", function (msg) {
        try {

            const obj = JSON.parse(msg);
            let key = obj.hasOwnProperty('key') ? obj.key : Object.keys(obj)[0];

            if (key === 'reaper') {
                console.log(obj.val)
                udpSend(obj.val, reaper_port);
            }
            else if (key === 'pd') {
                udpSend(obj.val, pd_port);
            }
                
        } catch (e) {

            console.error("json failed to parse " + e);
        }

    });

    socket.on("close", function () { // event
        console.log('received socket close', _url, uniqueid);
        socket.terminate();
    });

    socket.on("error", function (event) {
        console.error(event);
    });

});


// start server
server.listen(http_port, () => {
    let port = server.address().port;
    console.log('load webpage at', 'http://localhost:' + port);
    console.log('or', 'http://' + getIPAddresses() + ':' + port);
    console.log({
        "/port/localhost": 'http://localhost:' + port,
        "/port/ip": 'http://' + getIPAddresses() + ':' + port
    });
});


let getIPAddresses = function () {
    let os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (let deviceName in interfaces) {
        let addresses = interfaces[deviceName];

        for (let i = 0; i < addresses.length; i++) {
            let addressInfo = addresses[i];

            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};


let udp_server;
//let sendToIP = '127.0.0.1';

udp_server = dgram.createSocket('udp4');;

udp_server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

udp_server.on('listening', () => {
    udp_server.setSendBufferSize(65507);
    const address = udp_server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

udp_server.on('error', (err) => {
    console.error('udp send err', err);
});

udp_server.on('message', (msg, rinfo) => {  
    let obj = osc2obj(msg);
    //io.emit("msg", obj);
    
});

udp_server.bind(udp_input_port);


function udpSend(msg, port)
{
    const bndl = obj2osc(msg);
    if( bndl.length > 65507 ){
       // console.error(`udp_server error, buffer too large ${bndl.length}`)
        udp_server.send( obj2osc({
            sendError: `udp_server error, buffer too large ${bndl.length}`
        }), sendPort);
    }
    else
    {
        udp_server.send( bndl, port, (err) => {
            if( err ) console.error(`udp_server ${err} (size ${bndl.length})`);
          });
    }
    
}
