

var socket;
var socket_log = function(){}

/**
 * websocket handler
 */

var softlock = 0;

function _SocketPort_()
{
    this.socket = new WebSocket('ws://'+ location.host);
    
    this.socket.onmessage = function (event) {
        var msg = event.data;
        try {
            var obj = JSON.parse(msg);
            // handle input messages later
        }
        catch (e) {
            socket_log('parse error: ', e, msg);
            return;
        }
        
    }

    this.socket.onopen = function() {
    //    socket_log("opened port");
        socket_log("connected");

        softlock = 1;
    }

    this.socket.onclose = function() 
    {
        // socket.readyState = socket.CLOSED;
        softlock = 0;
        setTimeout( function() {
            if( (typeof socket.readyState === "undefined" || socket.readyState !== 1 ) && softlock == 0)
            {
                socket_log('reconnecting...');
                try {
                    port = new _SocketPort_();
                } catch(err) {
                    socket_log("failed to connect", err);
                }
                softlock = 1;
            }
        }, 1000 );

    }

    
    this.senderror = function (err) {}

    this.socket.onerror = function(error) {}

    this.close = function () {
        this.socket.close();
    }

    this.sendObj = function( obj )
    {
        if(this.socket.readyState === this.socket.OPEN)
        {
            this.socket.send( JSON.stringify(obj) );
        }
        else {
            socket_log("<b>no open port!</b> try refreshing in few seconds");
        }

    }

}



  /**
  * reconnect on visibiliy change
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
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
    socket_log("Page Visibility API not found");
} else {
    document.addEventListener(visibilityChange, function() {
        if (!socket) {
            socket_log('handleVisibilityChange, no port');
            return;
        }
        socket_log(document[hidden] + " " + (typeof socket.readyState));
        if (document[hidden]) {
            //    socket.sendObj({ "/bye" : "skinny" });
            socket_log('handleVisibilityChange, document[hidden]');
    
            socket.close();
        }
        else if (typeof socket.readyState === "undefined" || socket.readyState !== socket.OPEN) {
            socket_log('handleVisibilityChange, typeof socket.readyState === "undefined" || socket.readyState !== socket.OPEN');
    
            socket.close();
            socket = new _SocketPort_();
        }
        else {
            socket_log('handleVisibilityChange, unhandled case');
            // returning with open port ... shouldn't happen anymore
            //socket.sendObj({ "/helloAgain" : "skinny" });
        }
    
    }, false);
}


window.addEventListener("beforeunload", function() {
    if( socket.readyState === socket.OPEN  )
        socket.close();
})

window.addEventListener("load", function() {
    if( typeof socket === "undefined" )
        socket = new _SocketPort_();
 })
 

