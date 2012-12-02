var retina = window.devicePixelRatio > 1;

var pinsEl = $('#pins .container');

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

function showUser() {
    mortar.clear();
    $('#pins .menu').removeClass('show');
    $.get('/pins?exclude=' + (localStorage.user || ''), function(r) {
        $('.remaining-num').text(r.remaining);
        $('.remaining-plural').toggle(r.remaining !== 1);
        $('.remaining').addClass('show');
        r.pins.forEach(function(i) {
            loadImg(i).then(mortar.append);
        });
        $('#pins .menu').addClass('show');
    });
}

var colWidth = retina ? 112 : 222;
var margin = retina ? 10 : 15;

var numCols = ~~( $(pins).innerWidth() / colWidth );
numCols = Math.min(5, numCols);

pinsEl.width(numCols * (colWidth + margin) - margin);

var mortar = new Mortar(numCols, pinsEl);
