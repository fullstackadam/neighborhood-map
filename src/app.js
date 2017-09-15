// https://developer.here.com/documentation/maps/topics_api/h-places-explore.html
// http://places.demo.api.here.com/places/static/doc/public/#topics/categories.html
// display dispensary details in infoWindow

var map;

// default city coordinates
var defaultCities = {
	'new-york': {lat: 40.7128, lng: -74.0059},
	'san-francisco': {lat: 37.7749, lng: -122.4194},
	'denver': {lat: 39.7392, lng: -104.9903},
	'london': {lat: 51.5074, lng: -0.1278},
	'manila': {lat: 14.5995, lng: 120.9842}
};

var defaultLocation = defaultCities.denver;

var currentLocation = defaultLocation;

function initMap() {

	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(updateLatLng);
	    }

	    showPosition();
	}

	getLocation();

	function doAfterLocationsLoaded() {
		octopus.addMarkers();
	}

	function updateLatLng(position) {
		currentLocation.lat = position.coords.latitude;
		currentLocation.lng = position.coords.longitude;
	}

	function showPosition() {

	    // Create a map object and specify the DOM element for display.
		window.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: currentLocation.lat, lng: currentLocation.lng},
			scrollbar: false,
			zoom: 14
		});

		octopus.getLocations(currentLocation.lat, currentLocation.lng, doAfterLocationsLoaded);
	}
}

var octopus = {
	addMarkers: function() {
		vm.locations().forEach(function(location) {
			//console.log(location);
			// avoid creating multiple markers for the same location
			var lat = location.lat();
			var lng = location.lng();

			location.marker = vm.addMarker(
				{
					position: { 
						lat: lat, 
						lng: lng
					},
					icon: location.icon()
				}
			);

			//model.assignMarker(index, marker);
		});
	},
	getLocations: function(lat, lng, callback) {
		if (lat === null && lng === null) {
			lat = currentLocation.lat;
			lng = currentLocation.lng;
		}

		// save results to hash table
		// use here id as key

		var platform = new H.service.Platform({
		  'app_id': 'JaSjic2QLCII4hn6wa2V',
		  'app_code': '-9DtJ2wENRacgkqeW0haBg'
		});

		// Obtain an Explore object through which to submit search
		// requests:
		var search = new H.places.Explore(platform.getPlacesService()),
		  searchResult, error;

		// Define search parameters:
		var params = {
		  // Plain text search for places with the word "hotel"
		  // associated with them:
		  //'cat': type,
		  //  Search in the Chinatown district in San Francisco:
		  'at': lat+','+lng
		};

		// Define a callback function to handle data on success:
		function onResult(data) {
			console.log(data.results.items);
			console.log(vm);
			data.results.items.forEach(function(location, id) {
				location.id = id;

				vm.addLocation(location);
			});



			if (callback !== null) {
				callback();
			}
		}

		// Define a callback function to handle errors:
		function onError(data) {
			error = data;
		}

		// Run a search request with parameters, headers (empty), and
		// callback functions:
		search.request(params, {}, onResult, onError);
	},
};

function ViewModel() {
	var self = this;

	self.categoryFilter = ko.observable(['all']);
	self.locations = ko.observableArray([]);

	self.locationCategories = ko.computed(function() {
		var categories = ['all'];

		ko.utils.arrayForEach(self.locations(), function(location) {
			category = location.category();

			if (categories.indexOf(category) === -1) {
				categories.push(category);
			}
		});

		return categories;
	}, self);

	self.addMarker = function(location) {
		// save reference to marker
        var marker = new google.maps.Marker({
        	animation: google.maps.Animation.DROP,
        	position: location.position,
        	icon: location.icon,
        	map: map
        });

        return marker;
	};

	self.removeMarker = function(marker) {
		// google remove marker

		markers.remove(marker);
	};

	self.addLocation = function(location) {
		this.locations.push(new Location(location));
	};

	self.addCategory = function(category) {
		// make sure category doesn't already exist in array
		if (this.locationCategories.indexOf(category) === -1) {
			this.locationCategories.push(category);
		}
	};

	self.filteredLocations = ko.computed(function() {
		console.log('filter computed');
		
		var categoryFilter = self.categoryFilter()[0];
		
		if (categoryFilter === 'all') {
			return self.locations();
		}

		return ko.utils.arrayFilter(self.locations(), function(location) {
			if (location.category() === categoryFilter) {
				keep = true;
				location.marker.setVisible(true);
			} else {
				keep = false;
				location.marker.setVisible(false);
			}

			return keep;
		});
	}, self);

	self.onMouseoverListItem = function(location) {
		location.marker.defaultIcon = location.marker.icon;
		location.marker.setIcon('/images/here2.png');
		// save old zindex
		// set high zindex
	};

	self.onMouseoutListItem = function(location) {
		location.marker.setAnimation(null);
		location.marker.setIcon(location.marker.defaultIcon);

		if (location.infoWindow !== undefined) {
			location.infoWindow.close();

			// track open status
			location.infoWindow.opened = false;
		}
	};

	self.onClickListItem = function(location) { 
		// if info window doesn't exist create and assign to location object
		if (location.infoWindow === undefined) {
			location.infoWindow = new google.maps.InfoWindow({
				content: '<h3>'+location.name()+'</h3><p><strong>Address:</strong> '+location.address()+'</p><p><strong>Hours:</strong> '+location.hours()+'</p>'
			});
		}

		// https://github.com/angular-ui/angular-google-maps/issues/606
		// if info window not opened open it
		if (!location.infoWindow.opened) {
			location.infoWindow.open(map, location.marker);

			// track open status
			location.infoWindow.opened = true;
		}

		// animate marker
		location.marker.setAnimation(google.maps.Animation.BOUNCE);
	};
}

var Location = function(location) {
	var self = this;
	var hours = 'N/A';

	self.id = ko.observable(location.id);
	self.name = ko.observable(location.title);
	self.category = ko.observable(location.category.id);
	self.lat = ko.observable(location.position[0]);
	self.lng = ko.observable(location.position[1]);
	self.icon = ko.observable(location.icon);
	self.visible = ko.observable(true);

	self.visible.subscribe(function(newValue) {
		console.log(self.name() + ' set visible to ' + newValue);
		// make marker visible or invisible if exists
	});

	// if hours set save to location obj
	if (location.openingHours !== undefined) {
		hours = location.openingHours.text;
	}

	self.hours = ko.observable(hours);
	self.address = ko.observable(location.vicinity);
};

var vm = new ViewModel();

ko.applyBindings(vm);