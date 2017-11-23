function NavView() {
  const SELF = this;

  SELF.location = ko.observable().syncWith('currentLocation', true); 

  SELF.locations = ko.observableArray().subscribeTo('locations', true);

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
}

/**
 * @description Location Model
 * @
 **/
function LocationModel() {
  const SELF = this;

  SELF.renderMap = ko.observable(false).syncWith('renderMap');

  SELF.locations = ko.observableArray().publishOn('locations');

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
    const geocoder = new google.maps.Geocoder;

    const latlng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    geocoder.geocode({ 'location': latlng }, function(results, status) {

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
      SELF.current(SELF.locations()[0]);

      SELF.renderMap(true);
    });
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      SELF.getCityFromLatLng
    );
  } else {
    SELF.renderMap(true);
  }

  SELF.current = ko.observable(SELF.locations()[2]).syncWith('currentLocation');

  // set up default locations
  if (window.locations && window.defaultLocations !== 0) {
    window.locations.forEach(function(location) {
      SELF.locations.push(
        new Location(location.name, location.position)
      );

      if (location.default && location.default === true) {
        let lastIndex = SELF.locations().length - 1;

        SELF.current(SELF.locations()[lastIndex]);
      }
    });
  }
};
