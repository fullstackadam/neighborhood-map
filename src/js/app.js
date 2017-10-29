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

const Place = function Place(place) {
  const SELF = this;
  let hours = 'N/A';

  SELF.id = ko.observable(place.id);
  SELF.name = ko.observable(place.title);
  SELF.category = ko.observable(place.category.id);
  SELF.lat = ko.observable(place.position[0]);
  SELF.lng = ko.observable(place.position[1]);
  SELF.icon = ko.observable(place.icon);

  // if hours set save to place obj
  if (place.openingHours !== undefined) {
    hours = place.openingHours.text;
  }

  SELF.hours = ko.observable(hours);
  SELF.address = ko.observable(place.vicinity);
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
    ko.utils.arrayForEach(SELF.places(), function (place) {
      if (place.marker !== undefined) {
      	place.marker.setMap(null);
      }
    });

    SELF.places([]);

    SELF.recenterMap();

    // reset filter for new location
    SELF.categoryFilter(['all']);

    octopus.getPlaces(
    	newLocation.position.lat,
    	newLocation.position.lng,
    	octopus.addMarkers
    );
  });

  SELF.recenterMap = function recenterMap() {
    SELF.map.setCenter({
      lat: SELF.currentLocation().position.lat,
      lng: SELF.currentLocation().position.lng,
    });
  };

  SELF.categoryFilter = ko.observable(['all']);
  SELF.places = ko.observableArray([]);

  SELF.placeCategories = ko.computed(function () {
    const CATEGORIES = ['all'];

    ko.utils.arrayForEach(SELF.places(), function (place) {
      const CATEGORY = place.category();

      if (CATEGORIES.indexOf(CATEGORY) === -1) {
        CATEGORIES.push(CATEGORY);
      }
    });

    return CATEGORIES;
  }, SELF);

  SELF.addMarker = function addMarker(place) {
    // save reference to marker
    const MARKER = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: place.position,
      icon: place.icon,
      map: SELF.map,
    });

    return MARKER;
  };

  SELF.addPlace = function addPlace(place) {
    SELF.places.push(new Place(place));
  };

  SELF.addCategory = function addCategory(category) {
    // make sure category doesn't already exist in array
    if (SELF.placeCategories.indexOf(category) === -1) {
      SELF.placeCategories.push(category);
    }
  };

  SELF.filteredPlaces = ko.computed(function () {
    const CATEGORY_FILTER = SELF.categoryFilter()[0];

    return ko.utils.arrayFilter(SELF.places(), function(place) {
      let keep = false;

      if (place.category() === CATEGORY_FILTER || CATEGORY_FILTER === 'all') {
        keep = true;
      }

      if (place.marker !== undefined) {
        place.marker.setVisible(keep);
      }

      return keep;
    });
  }, SELF);

  SELF.onMouseoverListItem = function onMouseoverListItem(place) {
    place.marker.defaultIcon = place.marker.icon;
    place.marker.setIcon('/images/here.png');
  };

  SELF.onMouseoutListItem = function onMouseoutListItem(place) {
    place.marker.setAnimation(null);
    place.marker.setIcon(place.marker.defaultIcon);

    if (place.infoWindow !== undefined) {
      place.infoWindow.close();

      // track open status
      place.infoWindow.opened = false;
    }
  };

  SELF.onClickListItem = function onClickListItem(place) {
    // if info window doesn't exist create and assign to location object
    if (place.infoWindow === undefined) {
      const HTML = `<h3> ${place.name()}</h3>` +
        `<p><strong>Address:</strong> ${place.address()}</p>` +
        `<p><strong>Hours:</strong> ${place.hours()}</p>`;

      place.infoWindow = new google.maps.InfoWindow({
        content: HTML,
      });
    }

    // https://github.com/angular-ui/angular-google-maps/issues/606
    // if info window not opened open it
    if (!place.infoWindow.opened) {
      place.infoWindow.open(SELF.map, place.marker);

      // track open status
      place.infoWindow.opened = true;
    }

    // animate marker
    place.marker.setAnimation(google.maps.Animation.BOUNCE);
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
    VM.places().forEach(function (place) {
      const LAT = place.lat();
      const LNG = place.lng();

      place.marker = VM.addMarker({
        position: {
          lat: LAT,
          lng: LNG,
        },
        icon: place.icon(),
      });

      place.marker.addListener('click', function() {
        VM.onClickListItem(place);
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
      data.results.items.forEach(function (place, id) {
        location.id = id;

        VM.addPlace(place);
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

  	  VM.defaultCities.unshift({
		    name: name,
		    position: latlng,
      });

  	  VM.currentLocation({
    		name: name,
    		position: latlng,
  	  });

      showPosition();
  	});
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

window.addEventListener('resize', function() {
  $('#map').height(window.innerHeight - 50);

  VM.recenterMap();
});

$('#map').height(window.innerHeight - 50);

/*const options = {
  horizontal: false,
  itemNav: 'basic',
  speed: 300,
  mouseDragging: 1,
  touchDragging: 1
};

var frame = new Sly('#list', options).init();*/