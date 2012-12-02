var $login = $('#login');

function toggleLogin() {
    var showButton = !!($login.find('input[name=user]').val() && $login.find('input[name=pass]').val());
    $login.find('button').toggle(showButton);
    $login.find('.get-one').toggle(!showButton);
}

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

$login.on('submit', function(e) {
    e.preventDefault();
    var $this = $(this);
    $.post($this.attr('action'), $this.serialize(), function(data) {
        loggedIn(data);
    });
}).on('change blur keyup paste', 'input[name=user], input[name=pass]', function(e) {
    toggleLogin();
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
    toggleLogin();
});
