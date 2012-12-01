var order = [
        'login',
        'lookingfor',
        'pins',
        'matches',
        'messages'
        ];

var panes = {};

function wait(ms) {
    var $d = $.Deferred();
    setTimeout(function() {
        $d.resolve();
    }, ms);
    return $d.promise();
}

order.forEach(function(p) {
    panes[p] = $('#' + p);
})

var currentPane = 'login';

function showPane(newPane) {
    if (currentPane === newPane) {
        return;
    }

    panes[currentPane].addClass('moving');
    panes[newPane].addClass('moving');
    wait(0).then(function() {
        console.log('sliding');
        panes[currentPane].addClass(rel(currentPane, newPane));
        panes[currentPane].addClass(rel(newPane, currentPane));
        wait(0).then(function() {
            console.log('stopping');
            panes[currentPane].removeClass('moving');
            panes[newPane].removeClass('moving');
            currentPane = newPane;
        });
    });
}

function rel(n1, n2) {
    var p1 = _.indexOf(n1);
    var p2 = _.indexOf(n2);

    return p1 < p2 ? 'right' : 'left';
}
