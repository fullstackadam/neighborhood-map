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

    const platform = new H.service.Platform({
      app_id: 'JaSjic2QLCII4hn6wa2V',
      app_code: '-9DtJ2wENRacgkqeW0haBg',
    });

    // Obtain an Explore object through which to submit search
    let search = new H.places.Explore(platform.getPlacesService());
    let searchResult;
    let error;

    const lat = SELF.location().position.lat;
    const lng = SELF.location().position.lng;

    // Define search parameters:
    const PARAMS = {
      at: lat + ',' + lng,
    };

    // Define a callback function to handle data on success:
    function onResult(data) {
      // delete current places
      SELF.places([]);

      data.results.items.forEach(function (place, id) {
        place.id = id;
        SELF.places.push(new Place(place));
      });

      if (callback !== undefined) {
        callback();
      }
    }

    // Define a callback function to handle errors:
    function onError(data) {
      const error = data;

      SELF.loadingState('ERROR: could not load places from HERE api!');
    }

    // Run a search request
    search.request(PARAMS, {}, onResult, onError);
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