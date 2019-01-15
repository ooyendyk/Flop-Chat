document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // On connect
    socket.on('connect', () => {
        //When button is pressed
        $("#sendButton").click( () => {
            //Send message
            socket.emit('messageSend', document.getElementById('myMessage').value);
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
});