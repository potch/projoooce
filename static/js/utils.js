var hasTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

var actEvent = hasTouch ? 'touchstart' : 'click';