function ListVM() {
  const SELF = this;

  SELF.loadingState = ko.observable().syncWith('loadingState', true);

  SELF.places = ko.observableArray();

  SELF.markerActionQueue = ko.observableArray().syncWith('markerActionQueue');

  SELF.location = ko.observable().subscribeTo('currentLocation', true);

  SELF.filter = ko.observable(['all']).syncWith('filter');

  SELF.centerMap = ko.observable().syncWith('centerMap', true);

  SELF.filtered = ko.computed(function () {
    const CATEGORY_FILTER = SELF.filter()[0];

    return ko.utils.arrayFilter(SELF.places(), function(place) {
      let keep = false;

      if (place.category === CATEGORY_FILTER || CATEGORY_FILTER === 'all') {
        keep = true;
      }

      return keep;
    });
  }, SELF).publishOn('places');

  SELF.categories = ko.computed(function () {
    const CATEGORIES = ['all'];

    ko.utils.arrayForEach(SELF.places(), function (place) {
      const CATEGORY = place.category;

      if (CATEGORIES.indexOf(CATEGORY) === -1) {
        CATEGORIES.push(CATEGORY);
      }
    });

    return CATEGORIES;
  }, SELF).publishOn('categories');

  SELF.onMouseoverListItem = function(place) {
    SELF.newMarkerAction(
      place.markerId,
      'highlight'
    );
  };

  SELF.onMouseoutListItem = function(place) {
    SELF.newMarkerAction(
      place.markerId,
      'closeInfoWindow'
    );
  };

  SELF.onClickListItem = function(place) {
    SELF.newMarkerAction(
      place.markerId,
      'openInfoWindow'
    );
  };

  SELF.newMarkerAction = function(markerId, action) {
    action = {
      id: markerId,
      action: action,
    };

    SELF.markerActionQueue.push(action);
  }

  SELF.loadPlaces = function(callback) {
    SELF.loadingState('getting places from HERE api...');

    const endpoint = 'https://places.demo.api.here.com/places/v1/discover/explore';

    const app_id = window.here.app_id;
    const app_code = window.here.app_code;
    const auth = '&app_id=' + app_id + '&app_code=' + app_code;

    const lat = SELF.location().position.lat;
    const lng = SELF.location().position.lng;
    const latlng = 'at=' + lat + '%2C' + lng;

    const URL = endpoint + '?' + latlng + auth;

    $.get({
      url: URL
    })
    .done(function(data) {
      // delete current places
      SELF.places([]);

      data.results.items.forEach(function (place, id) {
        place.id = id;
        SELF.places.push(new Place(place));
      });

      if (callback !== undefined) {
        callback();
      }
    })
    .fail(function(data) {
      const error = data;

      SELF.loadingState('ERROR: could not load places from HERE api!');
    });
  };

  // get new places when location changes
  SELF.location.subscribe(function(location) {
    SELF.loadPlaces();
  });

  // initial load
  SELF.loadPlaces(
    function() { while(1) {if (window.map) SELF.centerMap(true); break;} } // run in loop till map rendered then center map
  );
}