    
    var socket = io();
    //slightly different from the lecture, uses form submit rather than button click
    $('#form').submit(function () {

        var message = $('#input').val();
        var username = $('#username').val();
        var room = $('#room').val();
        var sendto = $('#sendto').val();

        if(!username){
            username ="anon";
        }

        if(sendto && message){
            socket.emit('private message', sendto, username, message);
        }
        else if(room && message){
            socket.emit('room message', room, username, message);
        }
        else if (message) {
            socket.emit('chat message', username, message);
            
        }
        $("#input").val("");
        return false; 

    })

    $('#userform').submit(function () {
        var user = $('#username').val();

        if (user) {
            socket.emit('set username', user);
        }
        return false; 
    });

    socket.on('chat message', function(username,msg) {

        $('#messages').append("<li><h3>"+username+"</h3>:"+msg+"</li>");
        window.scrollTo(0, document.body.scrollHeight);

    });

    socket.on('private message', function(username,msg) {

        $('#messages').append("<li class='pm'><h3>"+username+"</h3>:"+msg+"</li>");
        window.scrollTo(0, document.body.scrollHeight);

    });


