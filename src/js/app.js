// use 'strict';
// https://github.com/paulmillr/es6-shim

// for testing
const NAV = new NavVM();
const LIST = new ListVM();
const MAP = new MapVM();

// fix for google maps call backs
function googleSuccess() {
  MAP.googleMapsLoaded(true);
}

function googleError() {
  MAP.loadingState('ERROR: could not load gmaps api');
}

// https://stackoverflow.com/questions/8662743/can-i-applybindings-to-more-than-one-dom-element-using-knockout
$(".navBind").each(function() {
  ko.applyBindings(NAV, this);
});

ko.applyBindings(LIST, document.getElementById('list'));
ko.applyBindings(MAP, document.getElementById('map'));

$('body').bootstrapMaterialDesign();
