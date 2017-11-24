// use 'strict';
// https://github.com/paulmillr/es6-shim

const NAV = new Nav();
const LIST = new List();
const MAP = new Map();
ko.applyBindings(NAV, document.getElementById('nav'));
ko.applyBindings(LIST, document.getElementById('list'));
ko.applyBindings(MAP, document.getElementById('map'));


/*const options = {
  horizontal: false,
  itemNav: 'basic',
  speed: 300,
  mouseDragging: 1,
  touchDragging: 1
};

var frame = new Sly('#list', options).init();*/