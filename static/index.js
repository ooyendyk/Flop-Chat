Document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // On connect
    socket.on('connect', () => {
        //When button is pressed
        sendButton.onClick = () => {
            //Submit comment
            socket.emit(document.getElementById('myMessage').value);
            //Clear comment section
            document.getElementById('myMessage').value = '';
        };
    });

    //When comment received
    socket.on('message', (msg) => {
        //Append to unordered list
        $('#messageLog').append('<li>'+msg+'<li/>');
        console.log('Received message');
    });
});