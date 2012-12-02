var $login = $('#login');

function toggleLogin() {
    var showButton = !!($login.find('input[name=user]').val() && $login.find('input[name=pass]').val());
    $login.find('form button').toggle(showButton);
    $login.find('.get-one').toggle(!showButton);
}

function loggedIn(user) {
    localStorage.user = user;
    $('#login').addClass('logged-in');
    $('#whoami h2 span').text(user);
    $('#logged').text('You are ' + user + '!')
                .append($('<a>', {'href': '/users/logout', 'text': 'Log out!'}))
                .addClass('show');
}

function loggedOut() {
    delete localStorage.user;
    $('#logged').removeClass('show');
    $('#login').removeClass('logged-in');
    showPane('login');
}

$('#whoami').on(actEvent, '.smiley', function(e) {
    e.preventDefault();
    var smiley = $(this);
    var which = smiley.hasClass('left') ? 0 : 1;
    if (smiley.hasClass('on')) {
        smiley.removeClass('on');
        $('.gen').eq(which).text('gal').removeClass('dude');
    } else {
        smiley.addClass('on');
        $('.gen').eq(which).text('guy').addClass('dude');
    }
});

$('#whoami button').on(actEvent, function() {
    showPane('pins');
    wait(300).then(showUser);
});

$login.find('form').on('submit', function(e) {
    e.preventDefault();
    var $this = $(this);
    $.post($this.attr('action'), $this.serialize(), function(data) {
        loggedIn(data);
    });
}).on('change blur keyup paste', 'input[name=user], input[name=pass]', function(e) {
    toggleLogin();
});

$(document).on(actEvent, '#logged a', function(e) {
    e.preventDefault();
    loggedOut();
});

$(function() {
    if (localStorage.user) {
        loggedIn(localStorage.user);
    } else {
        $login.find('form').addClass('show');
    }

    setTimeout(function() {
        toggleLogin();
    }, 200);

    if (window.location.hash.indexOf('#logout') > -1) {
        showPane('login');
        loggedOut();
    }
});
