document.addEventListener('DOMContentLoaded', () => {



    /* Initialize  Flop Chat */

    if (!localStorage.getItem('username')) {
        var username = prompt('Please enter your username');
        localStorage.setItem('username', username);
    } else {
        var username = localStorage.getItem('username');
    }

    var roomCurrent = '';
    var connectedDataRecieved = false;

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // On connect
    socket.on('connect', () => {



        /* User input */

        // Room button
        $(document).on('click', 'input.roomButton', (evt) => {
            var roomKey = $(evt.target).val();
            var dict = {'username': username, 'roomKey': roomKey};
            socket.emit('roomChangeRequest', dict);
        });

        // Send button
        $('#sendButton').click( () => {
            var messageSend = username + ': ' + document.getElementById('myMessage').value;
            document.getElementById('myMessage').value = '';
            socket.emit('messageSend', {'roomCurrent': roomCurrent, 'messageSend': messageSend});
        });

        // New room button
        $('#roomNew').click( () => {
            var roomName = document.getElementById('roomNewForm').value;
            document.getElementById('roomNewForm').value = '';
            socket.emit('roomCreate', {'username' : username, 'roomName' : roomName});
        });
    });



    /* Data from server  */

    // Render room button on connect
    socket.on('connectedReply', (roomListKey) => {
        if (connectedDataRecieved == false) {
            $('#roomList').append('<input class="roomButton" type="button" value="' + roomListKey + '"/>')
        }
    });

    // Prevent rendering of room buttons when a user connects
    socket.on('connectedDone', () => {
        connectedDataRecieved = true;
    });

    //When room is created
    socket.on('roomNew', (dict) => {
        $('#roomList').append('<input class="roomButton" type="button" value="' + dict['roomName'] + '"/>')
    });

    //When room name is taken
    socket.on('roomNameTaken', (dict) => {
        console.log('roomNameTaken: ' + dict + '  username: ' + username);
        if (dict['username'] == username) {
            console.log('alert!');
            alert('That room name is taken');
        }
    });

    //When server authorizes room change
    socket.on('roomChange', (dict) => {
        if (dict['username'] == username) {
            $('#messageLog').empty();
            var roomData = dict['roomData'];
            for (var messageNumber = 0; messageNumber < dict['roomData'].length; messageNumber++) {
                $('#messageLog').append('<li>' + roomData[messageNumber] + '<li/>');
            }
        }
        roomCurrent = dict['roomKey'];
    });

    //When message received
    socket.on('message', (dict) => {
        if (dict['roomCurrent'] == roomCurrent) {
            $('#messageLog').append('<li>' + dict['messageSend'] + '<li/>');
        }
        $('li:last').hide(); //Temporary fix to double post bug. Need to find root cause.
    });
});