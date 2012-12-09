var retina = window.devicePixelRatio > 1;

var pinsEl = $('#pins .container');

function escape_(s) {
    if (typeof s === undefined) {
        return;
    }
    return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
            .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
}

var yesLabels = [
    'I\'m smitten',
    '<3',
    'Heck yeah'
];

var noLabels = [
    'Not feelin\' it',
    'Not as such',
    'NOPE'
];


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

    function initCols() {
        for (var i=0; i<numCols; i++) {
            cols.push({
                y: 0,
                el: $("<div class='col'>")
            });
            parent.append(cols[i].el);
        }
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

    self.clear = function() {
        cols = [];
        parent.empty();
        initCols();
    }

    self.clear();
}


var currentUser;

function getRandom(list) {
    return list[~~(Math.random() * list.length)];
}

function showUsers(force) {
    $('#pins .menu').removeClass('show');
    $('#pins').addClass('loading');
    $('#prompt').hide();
    if (!pinsQueue.length || force) {
        $.get('/pins', {me: localStorage.user || ''}, function(r) {
            if (!r.length) {
                showPane('factory');
                return;
            }
            pinsQueue = r;
            nextUser();
        });
    } else {
        nextUser();
    }
}

function nextUser() {
    user = pinsQueue.shift(0);
    $('.remaining-num').text(user.remaining);
    $('.remaining-plural').toggle(user.remaining !== 1);
    $('.remaining').addClass('show');
    user.pins.forEach(function(i) {
        loadImg(i).then(mortar.append);
    });
    currentUser = user.user;
    $('#pins .yes').text(getRandom(yesLabels));
    $('#pins .no').text(getRandom(noLabels));
    $('#pins .menu').addClass('show');
    $('#pins').removeClass('loading');
    $('#prompt').show();
}

$('#pins button').touch(function() {
    mortar.clear();
    $('#pins .menu').removeClass('show');
    var data = {me: localStorage.user};
    if ($(this).hasClass('yes')) {
        data.yes = 1;
    }
    $.post('/heygirlilikeartsybakedgoodstoo/' + currentUser, data, function() {
        showUsers();
    });
});

$('.rate').touch(function() {
    showUsers(true);
});

$('#pins .scroller').bind('scroll', function() {
    var $this = $(this);
    var st = $this.scrollTop();
    var ih = $this.innerHeight();
    $('#pins .menu').toggleClass('off', st + ih  >= $this[0].scrollHeight);
});

// TODO: Actually show matches organically (issue #10).
$('#factory .potential p, #factory .luv').on('click', function() {
    showPane('matches');
});


var colWidth = retina ? 112 : 222;
var margin = retina ? 20 : 15;

var numCols = ~~( $(pins).innerWidth() / colWidth );
numCols = Math.min(5, numCols);

pinsEl.width(numCols * (colWidth + margin) - margin);

var mortar = new Mortar(numCols, pinsEl);
