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

        var goodCol = numCols-1;

        for (var i = numCols - 1; i >= 0; i--) {
            if (cols[i].y < cols[goodCol].y) {
                goodCol = i;
            }
        }

        var col = cols[goodCol];
        img.addClass('pinimg');
        img.attr('width', 192);
        col.el.append(img);
        col.y += img.height();

        setTimeout(function() {
            console.log('barf');
            img.addClass('show');
        }, 0);

    };
}

var mortar = new Mortar(4, document.body);

$.get('/pins/kkoberger90', function(r) {
    r.forEach(function(i) {
        loadImg(i).then(mortar.append);
    });
});
