var order = [
        'login',
        'lookingfor',
        'pins',
        'matches',
        'messages',
        'chat'
        ];

var panes = {};

function wait(ms) {
    var $d = $.Deferred();
    setTimeout(function() {
        $d.resolve();
    }, ms);
    return $d.promise();
}

var currentPane = 'login';

order.forEach(function(p) {
    panes[p] = $('#' + p);
    if (p != currentPane) {
        panes[p].addClass(rel(p, currentPane));
    }
})

function showPane(newPane) {
    var d = $.Deferred();

    if (currentPane === newPane) {
        d.reject();
    }

    panes[currentPane].addClass(rel(currentPane, newPane));
    panes[newPane].removeClass(rel(newPane, currentPane));

    wait(300).then(function() {
        currentPane = newPane;
        d.resolve();
    });

    return d;
}

function rel(n1, n2) {
    var p1 = _.indexOf(order, n1);
    var p2 = _.indexOf(order, n2);

    return p1 > p2 ? 'right' : 'left';
}

$(function() {
    $('#app').addClass('ready');
});
