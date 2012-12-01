var retina = window.devicePixelRatio > 1;

var pinsEl = $('#pins');

function escape_(s) {
    if (typeof s === undefined) {
        return;
    }
    return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
            .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
}

function loadImg(src) {
    var d = $.Deferred();
    var i = new Image();

    i.onload = function() {
        d.resolve(i);
    };
    i.onerror = function() {
        d.reject();
    };

    i.src = src;

    return d;
}

function Mortar(numCols, parent) {
    var self = this;

    var cols = [];

    parent = $(parent);

    for (var i=0; i<numCols; i++) {
        cols.push({
            y: 0,
            el: $("<div class='col'>")
        });
        parent.append(cols[i].el);
    }

    self.append = function(img) {

        img = $(img);

        var col = cols.sort(function(a, b) {
            return a.y - b.y;
        })[0];

        img.addClass('pinimg');
        col.el.append(img);
        col.y += img.outerHeight();

        setTimeout(function() {
            img.addClass('show');
        }, 0);

    };
}

var colWidth = retina ? 112 : 222;
var margin = retina ? 10 : 15;

var numCols = ~~( $(pins).innerWidth() / colWidth );
numCols = Math.min(5, numCols);

pinsEl.width(numCols * (colWidth + margin) - margin);

var mortar = new Mortar(numCols, pinsEl);

$.get('/pins/kkoberger90', function(r) {
    r.forEach(function(i) {
        loadImg(i).then(mortar.append);
    });
});

function loggedIn(user) {
    localStorage.user = user;
    $('form').hide().after($('<div>', {'class': 'logged', 'text': 'You are ' + user + '!'}));
    $('.logged').append(' ').append($('<a>', {'href': '/users/logout', 'text': 'Log out!'}));
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

if (localStorage.user) {
    loggedIn(localStorage.user);
} else {
    $('form').addClass('show');
}
