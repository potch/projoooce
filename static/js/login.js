
function loggedIn(user) {
    localStorage.user = user;
    $('form').hide().after($('<div>', {'class': 'logged', 'text': 'You are ' + user + '!'}));
    $('.logged').append(' ').append($('<a>', {'href': '/users/logout', 'text': 'Log out!'}));
    wait(1000).then(function() { showPane('pins').then(showUser) });
}

function loggedOut() {
    delete localStorage.user;
    $('.logged').remove();
    $('form').addClass('show').show();
}

$('form').on('submit', function(e) {
    e.preventDefault();
    var $this = $(this);
    $.post($this.attr('action'), $this.serialize(), function(data) {
        loggedIn(data);
    });
});

$(document).on('click', '.logged a', function(e) {
    e.preventDefault();
    loggedOut();
});

$(function() {
    if (localStorage.user) {
        loggedIn(localStorage.user);
    } else {
        $('form').addClass('show');
    }
});
