var log = document.getElementById('log');
var portlog = document.getElementById('port-log');

function display_log(msg)
{
    log.innerHTML = msg;
}

function display_port_log(msg)
{
    portlog.innerHTML = msg;
}


// send messages on events
var btn = document.getElementById('pd_play');
btn.addEventListener('click', function() {
    sendMsg({
        key: 'pd',
        val: {
            play: 'bang'
        }
    })
})

var volume = document.getElementById('volume');
volume.addEventListener('input', function() {
//            display_log('volume', volume.value)
    sendMsg('pd', {
        vol: parseFloat(volume.value) / 100.
    })
})

var selector = document.getElementById('song-select');
selector.addEventListener('change', function() {
    display_log('selector', selector.value)
    sendMsg('pd', {
        select: selector.value
    })
})


function play()
{
    sendMsg({
        key: 'reaper',
        val: {
            play: 'bang'
        }
    })
    
    display_log("play")
}

function stop()
{
    sendMsg({
        key: 'reaper',
        val: {
            stop: 'bang'
        }
    })
   
    display_log("stop")
}

var play_btn = document.getElementById('play');
var stop_btn = document.getElementById('stop');

play_btn.addEventListener('touchstart', play);
play_btn.addEventListener('click', play);

stop_btn.addEventListener('touchstart', stop);
stop_btn.addEventListener('click', stop);


/**
 * websocket handler
 */


var softlock = 0;
var port;

var softlock = 0;

function _SocketPort_()
{
    this.port = new WebSocket('ws://'+ location.host);

    this.close = function () {
        this.port.close();
    }

    this.port.onmessage = function (event) {
        var msg = event.data;
        try {
            var obj = JSON.parse(msg);
            // handle input messages later
        }
        catch (e) {
            display_port_log('parse error: ', e, msg);
            return;
        }
        
    }

    this.port.onopen = function() {
    //    display_log("opened port");
        display_port_log("connected");

        softlock = 1;
    }

    this.port.onclose = function() 
    {
        // port.readyState = port.CLOSED;
        softlock = 0;
        setTimeout( function() {
        if( (typeof port.readyState === "undefined" || port.readyState !== 1 ) && softlock == 0)
        {
            display_port_log('reconnecting...');
            try {
                port = new _SocketPort_();
            } catch(err) {
                display_port_log("failed to connect", err);
            }
            softlock = 1;
        }
        }, 1000 );

    }

    this.sendObj = function( obj )
    {

        if(this.port.readyState === this.port.OPEN)
        {
            this.port.send( JSON.stringify(obj) );
        }
        else {
            display_port_log("<b>no open port!</b> try refreshing in few seconds");
        }

    }

    this.senderror = function (err) {}

    this.port.onerror = function(error) {}

}


function sendMsg(_obj) {
    if( port ) {
        port.sendObj(_obj);
    }
}

  /**
  * Main window setup
  *
  */
 var hidden, visibilityChange;

 if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
   hidden = "hidden";
   visibilityChange = "visibilitychange";
 } else if (typeof document.msHidden !== "undefined") {
   hidden = "msHidden";
   visibilityChange = "msvisibilitychange";
 } else if (typeof document.webkitHidden !== "undefined") {
   hidden = "webkitHidden";
   visibilityChange = "webkitvisibilitychange";
 }

function handleVisibilityChange() {

    if (!port) {
        display_port_log('handleVisibilityChange, no port');
        return;
    }


    display_log(document[hidden] + " " + (typeof port.readyState));
    if (document[hidden]) {
        //    port.sendObj({ "/bye" : "skinny" });
        display_port_log('handleVisibilityChange, document[hidden]');

        port.close();
    }
    else if (typeof port.readyState === "undefined" || port.readyState !== port.OPEN) {
        display_port_log('handleVisibilityChange, typeof port.readyState === "undefined" || port.readyState !== port.OPEN');

        port.close();
        port = new _SocketPort_();
    }
    else {
        display_port_log('handleVisibilityChange, unhandled case');
        // returning with open port ... shouldn't happen anymore
        //port.sendObj({ "/helloAgain" : "skinny" });
    }

}


 if (typeof document.addEventListener === "undefined" || hidden === undefined) {
    display_port_log("Page Visibility API not found");
  } else {
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
  }


window.onbeforeunload = function() {

    if( port.readyState === port.OPEN  )
    {
        port.close();
    }
}

window.addEventListener("load", function() {

    if( typeof port === "undefined" )
        port = new _SocketPort_();
 
 })
 

