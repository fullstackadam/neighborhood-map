function Marker(map, place) {
  this.map = map;
  this.name = place.name;
  this.address = place.address;
  this.hours = place.hours;

  latlng = {
    lat: place.lat,
    lng: place.lng,
  };

  let markerObj = {
    animation: google.maps.Animation.DROP,
    position: latlng,
    icon: place.icon,
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
  console.log('highlight marker');
  this.defaultIcon = this.icon;
  this.setIcon('/images/here.png');
  this.setAnimation(google.maps.Animation.BOUNCE);
};

Marker.prototype.unhighlight = function() {
  console.log('unhighlight marker');
  this.setAnimation(null);
  this.setIcon(this.defaultIcon);

  if (this.infoWindow !== null) {
    this.infoWindow.close();
  }
};

Marker.prototype.openInfoWindow = function() {
  if (this.infoWindow === null) {
    this.infoWindow = new InfoWindow(this);

  }

  this.infoWindow.open();
};

Marker.prototype.closeInfoWindow = function() {
  if (this.infoWindow === null) {
    console.log('infoWindow does not exist');

    return;
  }

  this.infoWindow.close();
};