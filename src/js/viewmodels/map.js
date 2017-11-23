function MapView() {
  const SELF = this;

  SELF.location = ko.observable().subscribeTo('currentLocation', true);

  SELF.places = ko.observableArray().subscribeTo('filtered', true);

  SELF.infoWindows = ko.observableArray();

  SELF.triggerCenter = ko.observable(false).syncWith('centerMap');

  SELF.markerActionQueue = ko.observableArray().syncWith('markerActionQueue', true);

  SELF.markerActionQueue.subscribe(function(value) {
    if (SELF.markerActionQueue().length !== 0) {

      action = SELF.markerActionQueue.pop();
      //console.log(action);
      SELF.markers()[action.id][action['action']]();

      console.log('marker: ' + action.id + ' action: ' + action.action);
    }
  });

  SELF.center = function() {
    window.map.setCenter({
      lat: SELF.location().position.lat,
      lng: SELF.location().position.lng,
    });
  };

  SELF.oldMarkers = [];

  SELF.deleteOldMarkers = function() {
    SELF.oldMarkers.forEach(function(marker) {
      marker.setMap(null);
    });
  };

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

  SELF.render = ko.observable().syncWith('renderMap', true);

  SELF.render.subscribe(function(value) {
    if (window.map === null && value) {
      console.log('render map');

      window.map = new google.maps.Map(document.getElementById('map'), {
        center: {
          lat: SELF.location().position.lat,
          lng: SELF.location().position.lng,
        },
        scrollbar: false,
        zoom: 14,
        rotateControl: true,
      });
    }
  });

  SELF.triggerCenter.subscribe(function(value) {
    console.log('center updated: ' + value)
    if (window.map !== null && value) {
      SELF.center();
      SELF.triggerCenter(false);
    }
  });

  window.addEventListener('resize', function () {
    $('#map').height(window.innerHeight - 50);
  });

  $('#map').height(window.innerHeight - 50);
}