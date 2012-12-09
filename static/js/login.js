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

var smiley = $('#whoami .smiley');

function sex() {
    var smiley = $(this);
    var smiley2 = smiley.eq(1);
    var which = smiley.hasClass('left') ? 0 : 1;

    var $gender = $('.gender');

    if (which === 0 && (smiley.hasClass('on') != smiley2.hasClass('on'))) {
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

    var am = $gender.find('.am').text();
    var want = $gender.find('.want').text();

    $('input[name=sex_am]').val(am);
    $('input[name=sex_want]').val(want);
}

smiley.touch(sex);
sex();

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

    localStorage.sex_am = data.sex_am;
    localStorage.sex_want = data.sex_want;
    localStorage.zip = data.zip;
    localStorage.birthday = data.birthday;

    // Put sexes, location, and birthday.
    $.ajax({type: 'put', url: '/users/' + localStorage.user, data: data}).success(function() {

        // Check to see if there are any pins possible to show.
        $.get('/pins', {me: localStorage.user}, function(r) {
            if (r.user) {
                showPane('pins');
            } else {
                showPane('factory');
            }
            //wait(300).then(showUser);
        });

    });
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
                localStorage.sex_am = data.sex_am;
                localStorage.sex_for = data.sex_for;
                localStorage.zip = data.zip;
                localStorage.birthday = data.birthday;

                // TODO: Update sex icons when value is changed.
                $('input[name=sex_am]').val(data.sex_am);
                $('input[name=sex_want]').val(data.sex_for);

                $('input[name=zip]').val(data.zip);
                $('input[name=birthday]').val(data.birthday);
            });
        } else {
            if (localStorage.sex_am) {
                $('input[name=sex_am]').val(localStorage.sex_am);
            }
            if (localStorage.sex_want) {
                $('input[name=sex_want]').val(localStorage.sex_want);
            }
            if (localStorage.zip) {
                $('input[name=zip]').val(localStorage.zip);
            }
            if (localStorage.birthday) {
                $('input[name=birthday]').val(localStorage.birthday);
            }
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
