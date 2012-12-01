var retina = window.devicePixelRatio > 1;

var pinsEl = $('#pins');

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

var colWidth = retina ? 112 : 240;
var margin = retina ? 10 : 15;

var numCols = ~~( $(pins).innerWidth() / colWidth );
numCols = Math.min(6,numCols);

console.log(numCols);

pinsEl.width(numCols * (colWidth + margin));

var mortar = new Mortar(numCols, pinsEl);

$.get('/pins/kkoberger90', function(r) {
    r.forEach(function(i) {
        loadImg(i).then(mortar.append);
    });
});
