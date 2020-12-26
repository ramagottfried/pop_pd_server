
'use strict';

const http_port = 5001;

const http  = require('http');
const express = require('express');
const socketio = require('socket.io');
const dgram = require('dgram');

const app = express();
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = socketio(server);

const { obj2osc, osc2obj } = require('./o');

io.on('connect', (socket) => {
    console.log("connected to namespace-> ", socket.nsp.name);
    initSocket(socket);
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

function initSocket(socket)
{
    socket.on("disconnect", () => {
        console.log(`ciao! ${socket}`);
    });

    socket.on('msg', msg => {
//        console.log(msg);
        udpSend(msg);
    })
}


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
let sendToIP = '127.0.0.1';
let sendPort = 7777;

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
    io.emit("msg", obj);
});

udp_server.bind(8888);


function udpSend(msg)
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
        udp_server.send( bndl, sendPort, (err) => {
            if( err ) console.error(`udp_server ${err} (size ${bndl.length})`);
          });
    }
    
}
