// https://developer.here.com/documentation/maps/topics_api/h-places-explore.html
// http://places.demo.api.here.com/places/static/doc/public/#topics/categories.html
// conforms to the airbnb style guide
// use 'strict';
// https://github.com/paulmillr/es6-shim
// onresize set map center

/**
 * @description Represents a location
 * @constructor
 * @param {object} location - location properties
 * @returns {object} location with properties set as observables
 */

const Location = function Location(location) {
  const SELF = this;
  let hours = 'N/A';

  SELF.id = ko.observable(location.id);
  SELF.name = ko.observable(location.title);
  SELF.category = ko.observable(location.category.id);
  SELF.lat = ko.observable(location.position[0]);
  SELF.lng = ko.observable(location.position[1]);
  SELF.icon = ko.observable(location.icon);

  // if hours set save to location obj
  if (location.openingHours !== undefined) {
    hours = location.openingHours.text;
  }

  SELF.hours = ko.observable(hours);
  SELF.address = ko.observable(location.vicinity);
};

function ViewModel() {
  const SELF = this;

  SELF.map = null;

  SELF.firstRun = true;

  SELF.defaultCities = ko.observableArray([{
    name: 'New York, NY',
    position: {
      lat: 40.7128,
      lng: -74.0059,
    },
  },
  {
    name: 'San Francisco, CA',
    position: {
      lat: 37.7749,
      lng: -122.4194,
    },
  },
  {
    name: 'Denver, CO',
    position: {
      lat: 39.7392,
      lng: -104.9903,
    },
  },
  {
    name: 'London, UK',
    position: {
      lat: 51.5074,
      lng: -0.1278,
    },
  },
  {
    name: 'Manila, PH',
    position: {
      lat: 14.5995,
      lng: 120.9842,
    },
  }]);

  // set to Denver by default
  SELF.currentLocation = ko.observable(SELF.defaultCities()[2]);

  SELF.currentLocation.subscribe(function (newLocation) {
    if (SELF.firstRun) {
      return false;
    }

    // wipe out markers
    ko.utils.arrayForEach(SELF.places(), function (location) {
      console.log(location.marker);
      location.marker.setMap(null);
    });

    SELF.places([]);

    SELF.map.setCenter({
      lat: newLocation.position.lat,
      lng: newLocation.position.lng,
    });

    octopus.getPlaces(newLocation.position.lat, newLocation.position.lng, octopus.addMarkers);
  });

  SELF.categoryFilter = ko.observable(['all']);
  SELF.places = ko.observableArray([]);

  SELF.locationCategories = ko.computed(function () {
    const CATEGORIES = ['all'];

    ko.utils.arrayForEach(SELF.places(), function (location) {
      const CATEGORY = location.category();

      if (CATEGORIES.indexOf(CATEGORY) === -1) {
        CATEGORIES.push(CATEGORY);
      }
    });

    return CATEGORIES;
  }, SELF);

  SELF.addMarker = function addMarker(location) {
    // save reference to marker
    const MARKER = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: location.position,
      icon: location.icon,
      map: SELF.map,
    });

    return MARKER;
  };

  SELF.addLocation = function addLocation(location) {
    SELF.places.push(new Location(location));
  };

  SELF.addCategory = function addCategory(category) {
    // make sure category doesn't already exist in array
    if (SELF.locationCategories.indexOf(category) === -1) {
      SELF.locationCategories.push(category);
    }
  };

  SELF.filteredPlaces = ko.computed(function () {
    const CATEGORY_FILTER = SELF.categoryFilter()[0];

    return ko.utils.arrayFilter(SELF.places(), function(location) {
      let keep = false;

      if (location.category() === CATEGORY_FILTER || CATEGORY_FILTER === 'all') {
        keep = true;
      }

      if (location.marker !== undefined) {
        location.marker.setVisible(keep);
      }

      return keep;
    });
  }, SELF);

  SELF.onMouseoverListItem = function onMouseoverListItem(location) {
    location.marker.defaultIcon = location.marker.icon;
    location.marker.setIcon('/images/here.png');
  };

  SELF.onMouseoutListItem = function onMouseoutListItem(location) {
    location.marker.setAnimation(null);
    location.marker.setIcon(location.marker.defaultIcon);

    if (location.infoWindow !== undefined) {
      location.infoWindow.close();

      // track open status
      location.infoWindow.opened = false;
    }
  };

  SELF.onClickListItem = function onClickListItem(location) {
    // if info window doesn't exist create and assign to location object
    if (location.infoWindow === undefined) {
      const HTML = `<h3> ${location.name()}</h3>` +
        `<p><strong>Address:</strong> ${location.address()}</p>` +
        `<p><strong>Hours:</strong> ${location.hours()}</p>`;

      location.infoWindow = new google.maps.InfoWindow({
        content: HTML,
      });
    }

    // https://github.com/angular-ui/angular-google-maps/issues/606
    // if info window not opened open it
    if (!location.infoWindow.opened) {
      location.infoWindow.open(SELF.map, location.marker);

      // track open status
      location.infoWindow.opened = true;
    }

    // animate marker
    location.marker.setAnimation(google.maps.Animation.BOUNCE);
  };

  SELF.onCitySelection = function onCitySelection(city) {
    SELF.currentLocation(city);
  };

  SELF.onFilterSelection = function onFilterSelection(filter) {
    SELF.categoryFilter([filter])
  };
}

const VM = new ViewModel();

const octopus = {
  addMarkers() {
    VM.places().forEach(function (location) {
      const LAT = location.lat();
      const LNG = location.lng();

      location.marker = VM.addMarker({
        position: {
          lat: LAT,
          lng: LNG,
        },
        icon: location.icon(),
      });
    });
  },
  getPlaces(lat, lng, callback) {
    VM.firstRun = false;

    const platform = new H.service.Platform({
      app_id: 'JaSjic2QLCII4hn6wa2V',
      app_code: '-9DtJ2wENRacgkqeW0haBg',
    });

    // Obtain an Explore object through which to submit search
    let search = new H.places.Explore(platform.getPlacesService());
    let searchResult;
    let error;

    // Define search parameters:
    const PARAMS = {
      at: lat + ',' + lng,
    };

    // Define a callback function to handle data on success:
    function onResult(data) {
      data.results.items.forEach(function (location, id) {
        location.id = id;

        VM.addLocation(location);
      });

      if (callback !== null) {
        callback();
      }
    }

    // Define a callback function to handle errors:
    function onError(data) {
      error = data;
    }

    // Run a search request
    search.request(PARAMS, {}, onResult, onError);
  },
};

function initMap() {
  function showPosition() {
    // Create a map object and specify the DOM element for display.
    VM.map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: VM.currentLocation().position.lat,
        lng: VM.currentLocation().position.lng,
      },
      scrollbar: false,
      zoom: 14,
      rotateControl: true,
    });

    octopus.getPlaces(VM.currentLocation().position.lat, VM.currentLocation().position.lng, octopus.addMarkers);
  }

  // update location data based on user position
  function updateLatLng(position) {
  	const geocoder = new google.maps.Geocoder;

  	const latlng = {
	  lat: position.coords.latitude,
      lng: position.coords.longitude,
	};

  	geocoder.geocode({ 'location': latlng }, function(results, status) {
  	  console.log(results);

  	  // locality = city
  	  // administrative_area_level_1 = state

	  VM.currentLocation({
		name: 'filler',
		position: latlng,
	  });
  	});

    showPosition();
  }

  // request user location from browser
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(updateLatLng);
    } else {
      showPosition();
    }
  }

  getLocation();
}

ko.applyBindings(VM);
