var socket = io();   
        
        // receiving messages
        socket.on('msg', (buf) => {
            console.log(buf);
        })

        // send messages on events
        let btn = document.getElementById('pd_play');
        btn.addEventListener('click', () => {
            socket.emit('pd', {
                play: 'bang'
            })
        })

        let volume = document.getElementById('volume');
        volume.addEventListener('input', () => {
//            console.log('volume', volume.value)
            socket.emit('pd', {
                vol: parseFloat(volume.value) / 100.
            })
        })

        let selector = document.getElementById('song-select');
        selector.addEventListener('change', () => {
            console.log('selector', selector.value)
            socket.emit('pd', {
                select: selector.value
            })
        })


        document.getElementById('play').addEventListener('click', () => {
            socket.emit('reaper', {
                play: 'bang'
            })
        })

        document.getElementById('stop').addEventListener('click', () => {
            socket.emit('reaper', {
                stop: 'bang'
            })
        })
