function Marker(map, place) {
  this.map = map;
  this.name = place.name;
  this.address = place.address;
  this.hours = place.hours;
  this.icon = place.icon;

  latlng = {
    lat: place.lat,
    lng: place.lng,
  };

  let markerObj = {
    animation: google.maps.Animation.DROP,
    position: latlng,
    icon: this.icon,
    map: this.map,
  };

  google.maps.Marker.call(this, markerObj);

  this.infoWindow = null;

  this.addListener('click', function() {
    console.log('marker clicked');
    this.openInfoWindow();
  });
}

Marker.prototype = Object.create(google.maps.Marker.prototype);

Marker.constructor.prototype = Marker;

Marker.prototype.highlight = function() {
  this.defaultIcon = this.icon;
  this.setIcon('/images/here.png');
  this.setAnimation(google.maps.Animation.BOUNCE);
};

Marker.prototype.unhighlight = function() {
  this.setAnimation(null);
  this.setIcon(this.defaultIcon);

  this.closeInfoWindow();
};



Marker.prototype.openInfoWindow = function() {
  if (this.infoWindow === null) {
    this.infoWindow = new InfoWindow(this);

  }

  this.infoWindow.open();
};

Marker.prototype.closeInfoWindow = function() {
  if (this.infoWindow === null || !this.infoWindow.opened) {
    return;
  }

  this.infoWindow.close();
};