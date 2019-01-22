document.addEventListener('DOMContentLoaded', () => {

    //Initialise username
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


        socket.emit('connected');

        $(document).on('click', "input.roomButton", (evt) => {
            var roomKey = $(evt.target).val();
            var dict ={'username': username, 'roomKey': roomKey};
            socket.emit('roomChangeRequest', dict);
        });

        //When button is pressed
        $("#sendButton").click( () => {
            //Send message
            var messageSend = username + ': ' + document.getElementById('myMessage').value;
            socket.emit('messageSend', {'roomCurrent': roomCurrent, 'messageSend': messageSend});
            //Clear comment section
            document.getElementById('myMessage').value = '';
        });


        //When 'New Room' is pressed
        $("#roomNew").click( () => {
            //var roomName = prompt('Please enter new room name');
            var roomName = document.getElementById('roomNewForm').value;
            document.getElementById('roomNewForm').value = '';
            //Check name
            if (typeof roomList !== 'undefined') {
                var roomTaken = false;
                for (var room = 0; room < roomList.length; room++) {
                    if (roomList[room] == roomName) {
                        roomTaken = true;
                    }
                }
                if (roomTaken == false) {
                    socket.emit('roomCreate', (roomName));
                }
            } else {
                socket.emit('roomCreate', (roomName));
            }
        });
    });

    socket.on('connectedReply', (roomListKey) => {
        if (connectedDataRecieved == false) {
            $('#roomList').append('<input class="roomButton" type="button" value="' + roomListKey + '"/>')
        }
    });

    socket.on('connectedDone', () => {
        connectedDataRecieved = true;
    });

    //On newRoom
    socket.on('roomNew', (room) =>{
        $('#roomList').append('<input class="roomButton" type="button" value="' + room + '"/>')
    });

    //On connectedData
    socket.on('connectedData', (room) => {
        $('#roomList').append('<input class="roomButton" type="button" value="' + room + '"/>')
    });

    //Render room messages
    socket.on('roomChange', (dict) =>{
        if (dict['username'] == username) {
            $('#messageLog').empty();
            var roomData = dict['roomData'];
            for (var messageNumber = 0; messageNumber < dict['roomData'].length; messageNumber++) {
                $('#messageLog').append('<li>' + roomData[messageNumber] + '<li/>');
            }
        }
        roomCurrent = dict['roomKey'];
    });

    //When comment received
    socket.on('message', (dict) => {
        //Append to unordered list
        if (dict['roomCurrent'] == roomCurrent) {
            $('#messageLog').append('<li>'+dict['messageSend']+'<li/>');
        }
        
    });

});