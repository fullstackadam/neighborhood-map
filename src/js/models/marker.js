/**
 * @description Represents a map Marker
 * @constructor
 * @param {object} place
 * @returns {object} marker
 */

function Marker(map, place) {
  this.map = map;
  this.name = place.name;
  this.address = place.address;
  this.hours = place.hours;
  this.icon = place.icon;
  this.defaultIcon = place.icon;

  const latlng = {
    lat: place.lat,
    lng: place.lng,
  };

  const markerObj = {
    animation: google.maps.Animation.DROP,
    position: latlng,
    icon: this.icon,
    map: this.map,
  };

  google.maps.Marker.call(this, markerObj);

  this.infoWindow = null;

  this.addListener('click', function() {
    this.openInfoWindow();
  });
}

// inherit google maps marker class
Marker.prototype = Object.create(google.maps.Marker.prototype);

Marker.constructor.prototype = Marker;

// set default highlighted marker icon from config file
Marker.prototype.highlightedIcon = window.markerHighlightedIcon;

// set to highlighted marker icon and animate
Marker.prototype.highlight = function() {
  this.setIcon(this.highlightedIcon);
  this.setAnimation(google.maps.Animation.BOUNCE);
};

// set to default icon and remove any animation
Marker.prototype.unhighlight = function() {
  this.setAnimation(null);
  this.setIcon(this.defaultIcon);

  //this.closeInfoWindow();
};

// create/open info window using marker data and highlight marker
Marker.prototype.openInfoWindow = function() {
  if (this.infoWindow === null) {
    this.infoWindow = new InfoWindow(this);
  }

  const marker = this;

  this.infoWindow.open();

  // run custom close method when info window closed with close button
  this.infoWindow.addListener('closeclick', function(e) {
    marker.closeInfoWindow();
  });

  this.highlight();
};

// close infowindow and unhighlight marker
Marker.prototype.closeInfoWindow = function() {
  if (this.infoWindow === null || !this.infoWindow.opened) {
    return;
  }

  this.infoWindow.close();
  this.unhighlight();
};