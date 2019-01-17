document.addEventListener('DOMContentLoaded', () => {

    //Initialise username
    if (!localStorage.getItem('username')) {
        var username = prompt('Please enter your username');
        localStorage.setItem('username', username);
    } else {
        var username = localStorage.getItem('username');
    }

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // On connect
    socket.on('connect', () => {
        //When button is pressed
        $("#sendButton").click( () => {
            //Send message
            socket.emit('messageSend', (username + ': ' + document.getElementById('myMessage').value));
            console.log('messageSend event');
            //Clear comment section
            document.getElementById('myMessage').value = '';
        });
    });

    //When comment received
    socket.on('message', (msg) => {
        //Append to unordered list
        $('#messageLog').append('<li>'+msg+'<li/>');
        console.log('message event');
    });

    //On connect to room
    socket.on('message_history', (messageHistory) => {
        if (messageHistory.length !== 0) {
            for (var messageNumber = 0; messageNumber < messageHistory.length; messageNumber++) {
                $('#messageLog').append('<li>' + messageHistory[messageNumber] + '<li/>');
            }
        } else {
            console.log('message_history is null')
        }

    });

});