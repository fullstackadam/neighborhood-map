function MapVM() {
  const SELF = this;

  SELF.googleMapsLoaded = ko.observable(false);

  SELF.createMap = function() {
    // so create map isn't called twice
    window.map = true;
    
    SELF.loadingState('rendering map...');

    window.map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: SELF.location().position.lat,
        lng: SELF.location().position.lng,
      },
      scrollbar: false,
      zoom: 14,
      rotateControl: true,
    });

    window.map.addListener('center_changed', function() {
      SELF.loadingState('Map rendered');
    });
  };

  SELF.loadingState = ko.observable().syncWith('loadingState', true);

  SELF.location = ko.observable().subscribeTo('currentLocation', true);

  // center map on new location when location updates
  SELF.location.subscribe(function() {
    SELF.center();
  });

  SELF.places = ko.observableArray().subscribeTo('places', true);

  SELF.infoWindows = ko.observableArray();

  SELF.triggerCenter = ko.observable(false).syncWith('centerMap');

  // queue for marker method calls from other models
  SELF.markerActionQueue = ko.observableArray().syncWith('markerActionQueue', true);

  SELF.markerActionQueue.subscribe(function(value) {
    if (SELF.markerActionQueue().length !== 0) {

      const action = SELF.markerActionQueue.shift();

      SELF.markers()[action.id][action['action']]();

      console.log('marker: ' + action.id + ' action: ' + action.action);
    }
  });

  // center map based on current location
  SELF.center = function() {
    window.map.setCenter({
      lat: SELF.location().position.lat,
      lng: SELF.location().position.lng,
    });
  };

  // store old markers here for proper deletion
  SELF.oldMarkers = [];

  // remove old markers from map
  SELF.deleteOldMarkers = function() {
    SELF.oldMarkers.forEach(function(marker) {
      marker.setMap(null);
    });
  };

  // create markers based on filtered places
  // store in observable array for easy access
  SELF.markers = ko.computed(function() {
    let markers = [],
        marker;

    // set new markers
    SELF.places().forEach(function (place, index) {
      marker = new Marker(window.map, place);
      markerIndex = markers.push(marker) - 1;

      SELF.places()[index].markerId = markerIndex;
    });

    SELF.deleteOldMarkers();
    SELF.oldMarkers = markers;

    return markers;
  }, SELF);

  SELF.render = ko.observable().syncWith('loadMap', true);

  // attempt to render map after default location set
  SELF.render.subscribe(function(value) {
    if (window.map === null && value && SELF.googleMapsLoaded()) {
      SELF.createMap();
    }
  });

  // attempt to render map after google maps api loaded
  SELF.googleMapsLoaded.subscribe(function(value) {
    if (window.map === null && value && SELF.render()) {
      SELF.createMap();
    }
  });

  // center map when synced observable is updated
  SELF.triggerCenter.subscribe(function(value) {
    if (window.map !== null && value) {
      SELF.center();
      SELF.triggerCenter(false);
    }
  });

  // resize map on resize event for testing and overriding google maps js
  window.addEventListener('resize', function () {
    $('#map').height(window.innerHeight - 50);
  });

  $('#map').height(window.innerHeight - 50);
}