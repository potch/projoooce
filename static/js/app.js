function loadImg(src) {
    var d = $.Deferred();
    var i = new Image();

    i.src = src;
    i.onload = function() {
        d.resolve(i);
    };
    i.onerror = function() {
        d.reject();
    };

    return d;
}

function Mortar(numCols, parent) {
    var self = this;

    var cols = [];

    for (var i=0; i<numCols.length; i++) {
        cols.push({
            pos: 0,
            el: $("<div class='col'>")
        });
        $(parent).push(cols[i].el);
    }

    self.append = function(img) {

        var goodCol = 0;

        for (var i = numCols-1; i >= 0; i--) {
            if (cols[i].pos < cols[goodCol].pos) {
                goodCol = i;
            }
        }

        var col = cols[goodCol];
        col.el.append(img);
        col.pos += img.height;

    };
}

var mortar = new Mortar(2, document.body);

$.get('/pins/kkoberger90', function(r) {
    r.forEach(function(i) {
        loadImg(i).then(mortar.append);
    });
});
