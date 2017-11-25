// use 'strict';
// https://github.com/paulmillr/es6-shim

const NAV = new Nav();
const LIST = new List();
const MAP = new Map();

// https://stackoverflow.com/questions/8662743/can-i-applybindings-to-more-than-one-dom-element-using-knockout
$(".navBind").each(function() {
  ko.applyBindings(NAV, this);
});

ko.applyBindings(LIST, document.getElementById('list'));
ko.applyBindings(MAP, document.getElementById('map'));

$('body').bootstrapMaterialDesign();
/*const options = {
  horizontal: false,
  itemNav: 'basic',
  speed: 300,
  mouseDragging: 1,
  touchDragging: 1
};

var frame = new Sly('#list', options).init();*/