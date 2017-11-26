function Nav() {
  const SELF = this;

  SELF.loadMap = ko.observable(false).syncWith('loadMap');

  SELF.location = ko.observable().syncWith('currentLocation'); 

  SELF.locations = ko.observableArray();

  SELF.loadingState = ko.observable('Loading...').syncWith('loadingState');

  SELF.loadStateTimeout = null;

  // if error found stop accepting load state messages from other view models
  SELF.loadingState.subscribe(function(msg) {
    // make sure time outs don't bubble up
    clearTimeout(SELF.loadStateTimeout);

    if (msg.match(/error/i) !== null) {
      SELF.loadingState.stopSyncingWith('loadingState');

      // return immediately so error doesn't get cleared
      return;
    }

    // clears load state message after 2 seconds
    SELF.loadStateTimeout = setTimeout(function() { SELF.loadingState(''); }, 2000);
  });

  SELF.filter = ko.observable().syncWith('filter', true);
  SELF.categories = ko.observableArray().subscribeTo('categories', true);

  SELF.centerMap = ko.observable().syncWith('centerMap', true);

  SELF.recenterMap = function() {
    SELF.centerMap(true);
  };

  SELF.onCitySelection = function(location) {
    SELF.location(location);
  };

  SELF.onFilterSelection = function(filter) {
    SELF.filter([filter]);
  };

  SELF.add = function(name, latlng) {
    SELF.locations.unshift({
      name: name,
      position: latlng,
    });
  };

  SELF.getUserLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        SELF.getCityFromLatLng
      );
    }
  };

  SELF.getCityFromLatLng = function(position) {
    SELF.loadingState('getting your municipality from gps coordinates...');

    const geocoder = new google.maps.Geocoder;

    const latlng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    geocoder.geocode({ 'location': latlng }, function(results, status) {
      if (status !== 'OK') {
        // acceptable failure
        SELF.loadingState('could not get municipality from gps coordinates');
        SELF.loadMap(true);

        return;
      }
      results = results[0].address_components;
      let types = [];
      let city = false;
      let state = false;
      
      for (let i = 0; i < results.length; i++) {
        types = results[i].types;

        for (let j = 0; j < types.length; j++) {
          if (!city && types[j] === 'locality') {
            city = results[i].short_name;
          }

          if (!state && types[j] === 'administrative_area_level_1') {
            state = results[i].short_name;
          }
        }
      }

      const name = city + ', ' + state;

      // add location as first element in location array
      SELF.add(name, latlng);

      // make first location current location
      SELF.location(SELF.locations()[0]);

      SELF.loadMap(true);
    });
  };

  // attempt to get user location before rendering map
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      SELF.getCityFromLatLng,
      function() { SELF.loadMap(true); }
    );
  } else {
    SELF.loadMap(true);
  }

  // set up default locations
  if (window.locations && window.defaultLocations !== 0) {
    window.locations.forEach(function(location) {
      SELF.locations.push(
        new Location(location.name, location.position)
      );

      if (location.default && location.default === true) {
        let lastIndex = SELF.locations().length - 1;

        SELF.location(SELF.locations()[lastIndex]);
      }
    });
  }
}
