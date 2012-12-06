var $login = $('#login'),
    $loginForm = $login.find('form.login');

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
                .append($('<a>', {'href': '/users/logout', 'text': 'Log out!', 'class': 'logout'}))
                .addClass('show');
}

function loggedOut() {
    delete localStorage.user;
    $('#logged').removeClass('show');
    $('#login').removeClass('logged-in');
    showPane('login');
}

$('#whoami .smiley').touch(function(e) {
    var smiley = $(this);
    var which = smiley.hasClass('left') ? 0 : 1;

    var smiley2 = $('#whoami .smiley').eq(1);
    if(which === 0 && (smiley.hasClass('on') != smiley2.hasClass('on'))) {
        // If you click the left one and the people are opposite sexes already, toggle both
        smiley2.trigger('touch');
    }

    if (smiley.hasClass('on')) {
        smiley.removeClass('on');
        $('.gen').eq(which).text('gal').removeClass('dude');
    } else {
        smiley.addClass('on');
        $('.gen').eq(which).text('guy').addClass('dude');
    }

});


$.fn.serializeFlat = function() {
    var data = {};
    $(this).serializeArray().map(function(v) {
        data[v.name] = v.value;
    });
    return data;
};

$('.woo').on('submit', function(e) {
    var $form = $(this).closest('form');

    var data = $form.serializeFlat();
    data.exclude = localStorage.user;

    localStorage.zip = data.zip;
    localStorage.birthday = data.birthday;

    $.get($form.attr('action'), data, function(r) {
        if (r.user) {
            showPane('pins');
        } else {
            showPane('factory');
        }
    });
    wait(300).then(showUser);
    $form.find('button').touch();
    e.preventDefault();
});


// This simulates pressing...
$loginForm.find('button').touch();

$loginForm.on('submit', function(e) {
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

        if (!localStorage.zip || !localStorage.birthday) {
            $.get('/users/' + localStorage.user, function(data) {
                // TODO: Update gender stuff.
                data.sex_am;
                data.sex_for;
                $('input[name=zip]').val(data.zip);
                $('input[name=birthday]').val(data.birthday);
            });
        }
    } else {
        $loginForm.addClass('show');
    }

    setTimeout(function() {
        toggleLogin();
    }, 200);

    if (window.location.hash.indexOf('#logout') > -1) {
        showPane('login');
        loggedOut();
    }
});
