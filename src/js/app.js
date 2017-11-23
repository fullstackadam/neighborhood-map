// https://developer.here.com/documentation/maps/topics_api/h-places-explore.html
// http://places.demo.api.here.com/places/static/doc/public/#topics/categories.html
// conforms to the airbnb style guide
// use 'strict';
// https://github.com/paulmillr/es6-shim
// onresize set map center

// http://www.wrapcode.com/communication-between-multiple-view-models-in-knockoutjs-mvvm-the-right-approach/

const NavViewI = new NavView();
const ListViewI = new ListView();
const MapViewI = new MapView();
ko.applyBindings(NavViewI, document.getElementById('nav'));
ko.applyBindings(ListViewI, document.getElementById('list'));
ko.applyBindings(MapViewI, document.getElementById('map'));


/*const options = {
  horizontal: false,
  itemNav: 'basic',
  speed: 300,
  mouseDragging: 1,
  touchDragging: 1
};

var frame = new Sly('#list', options).init();*/