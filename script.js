
/**
 * event functions that send messages to reaper 
 */ 

function play()
{
    sendReaperMessage({
        play: 'bang'
    });
    
    display_log("play")
}

function stop()
{
    sendReaperMessage({
        stop: 'bang'
    });
   
    display_log("stop")
}

/**
 * attaching the functions to the UI elements:
 */
var play_btn = document.getElementById('play');
var stop_btn = document.getElementById('stop');

play_btn.addEventListener('touchstart', play);
play_btn.addEventListener('click', play);

stop_btn.addEventListener('touchstart', stop);
stop_btn.addEventListener('click', stop);



/**
 * some logging in the HTML since we're having trouble getting the remote debugging working with the iPad
 */
var log = document.getElementById('log');
var portlog = document.getElementById('port-log');

function display_log(msg)
{
    log.innerHTML = msg;
}

function socket_log(msg)
{
    portlog.innerHTML = msg;
}


/**
 * 
 * @param {Object} obj object to send
 * 
 * main function to use to send messages to Reaper, the obj is a Js object
 * 
 */
function sendReaperMessage(obj)
{
    /**
     * note: the websocket-handler now creates the socket variable for you
     * not my favorite solution but it works! :-)
     */
        
    if( !socket )
    {
        socket_log('no socket!!')
        return;
    }    

    socket.sendObj({
        key: "reaper",
        val: obj
    })
}




// pd stuff

function sendPdMessage(obj)
{
    socket.sendObj({
        key: "pd",
        val: obj
    })
}


var volume = document.getElementById('volume');
volume.addEventListener('input', function() {
    display_log('volume: ' + parseFloat(volume.value) / 100.)
    sendPdMessage({
        vol: parseFloat(volume.value) / 100.
    })
})

var selector = document.getElementById('song-select');
selector.addEventListener('change', function() {
    display_log('selector', selector.value)
    sendPdMessage({
        select: selector.value
    })
})

var btn = document.getElementById('pd_play');
btn.addEventListener('click', function() {
    sendPdMessage({
        play: 'bang'
    })
})
