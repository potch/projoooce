var hasTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
var actEvent = hasTouch ? 'touchstart' : 'click';
var actEventOff = hasTouch ? 'touchend' : 'click';

$.fn.touch = function (f) {
    return $(this).map(function (i, elm) {
        var $e = $(elm);
        var pX, pY = false;
        var moveOff = false;
        $e.bind('mousedown touchstart', function(e) {
            if(f) e.preventDefault();
  
            moveOff = false;
            pX, pY = false;
  
            if($e.is(':disabled')) return;
            $e.addClass('pressed');
        }).bind('touchmove', function(e) {
            if(f) e.preventDefault();
  
            var touch = e.originalEvent.touches[0];
            pX = touch.pageX;
            pY = touch.pageY;
  
            var b_top = $e.offset()['top'];
            var b_left = $e.offset()['left'];
            var b_bottom = b_top + $e.outerHeight();
            var b_right = b_left + $e.outerWidth();
  
            b_top -= 10;
            b_bottom += 10;
            b_left -= 10;
            b_right += 10;
  
            if(pY < b_top || pX < b_left || pY > b_bottom || pX > b_right) {
                $e.removeClass('pressed');
                moveOff = true;
            }
        }).bind('mouseup touchend', function(e) {
            if(f) e.preventDefault();
            if($e.is(':disabled')) return;
console.log(f, moveOff);
            if(!moveOff) {
                $e.removeClass('pressed');
                if(f) { return f.apply(this, arguments); }
            }
        }).bind('touch', function() {
            $e.trigger('touchend');
        });
        /*
        .click(function(e) {
            $e.removeClass('pressed');
            e.preventDefault();
        });
        */
    });
};
