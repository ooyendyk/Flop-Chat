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
            // Changes active room button color
            roomButton = document.getElementsByClassName("roomButton");
            for (i = 0; i < roomButton.length; i++) {
                roomButton[i].className = roomButton[i].className.replace(" active", "");
            }
            evt.currentTarget.className += " active";
            // Emit room change request
            socket.emit('roomChangeRequest', dict);
        });

        // Send button
        $('#sendButton').click( () => {
            var messageSend = '<b>' + username + ': </b>' + document.getElementById('myMessage').value;
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
    socket.on('connectedReply', (roomListKey) => { // change #tab to #roomlist for greater consistency
        if (connectedDataRecieved == false) {
            $('#tab').append('<input class="roomButton" type="button" value="' + roomListKey + '"/>')
        }
    });

    // Prevent rendering of room buttons when a user connects
    socket.on('connectedDone', () => {
        connectedDataRecieved = true;
    });

    //When room is created
    socket.on('roomNew', (dict) => { // change #tab to #roomlist for greater consistency
        console.log('Adding room: ' + dict['username'] + ' : ' + dict['roomName']);
        $('#tab').append('<input class="roomButton" type="button" value="' + dict['roomName'] + '">')
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
                $('#messageLog').append('<p>' + roomData[messageNumber] + '<p/>');
            }
        }
        roomCurrent = dict['roomKey'];
    });

    //When message received
    socket.on('message', (dict) => {
        if (dict['roomCurrent'] == roomCurrent) {
            $('#messageLog').append('<p>' + dict['messageSend'] + '<p/>');
        }
        $('li:last').hide(); //Temporary fix to double post bug. Need to find root cause.
    });
});