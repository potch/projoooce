function initChat() {
    $('#chat-form').remove();

    showPane('chat');
    var $cf = $('<form>', {'id': 'chat-form'});
    $cf.append($('<input>', {'type': 'text', 'placeholder': 'Make it happen'}));
    $cf.append($('<button>', {'text': '+'}));
    $('#chat-input').append($cf);

    var fb = new Firebase('https://pinterested.firebaseIO.com/chat/' + 'abc');

    fb.on('child_added', function (snapshot) {
        var message = snapshot.val();
        $('<div/>').text(message.text).prepend($('<em/>').text(message.name+': ')).appendTo($('#chat-text'));
        $('#chat-text')[0].scrollTop = $('#chat-text')[0].scrollHeight;
    });

    $cf.submit(function(e) {
        var text = $('input', this).val();
        var name = localStorage.user;
        fb.push({name:name, text:text});
        return false;
    });
}


$('.match').on('click', function() {
    initChat();
});


$('#chat .back').on('click', function() {
    if (window.location.pathname == '/chat') {
        window.location = '/';
    } else {
        showPane('matches');
    }
});


$(function() {
    if (window.location.pathname == '/chat') {
        initChat();
    }
});
