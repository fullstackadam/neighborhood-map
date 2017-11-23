function InfoWindow(marker) {
  // if info window doesn't exist create and assign to location object
//if (marker.infoWindow === undefined) {

  this.marker = marker;
  this.marker.setIcon('/images/here.png');

  const HTML = this.html(
    marker.name, 
    marker.address, 
    marker.hours
  );

  google.maps.InfoWindow.call(
    this, 
    {
      content: HTML,
    }
  );

  this.addListener('closeclick', function() {
    this.close();
  });
}

InfoWindow.prototype = Object.create(google.maps.InfoWindow.prototype);

// https://github.com/angular-ui/angular-google-maps/issues/606
InfoWindow.prototype.opened = false;

InfoWindow.prototype.html = function(name, address, hours) {
  const HTML = `<h3> ${name}</h3>` +
    `<p><strong>Address:</strong> ${address}</p>` +
    `<p><strong>Hours:</strong> ${hours}</p>`;

  return HTML;
};

InfoWindow.prototype.open = function() {
  google.maps.InfoWindow.prototype.open.call(
    this,
    this.marker.map,
    this.marker
  );

  this.marker.setAnimation(google.maps.Animation.BOUNCE);

  this.opened = true;
};

InfoWindow.prototype.close = function() {
  google.maps.InfoWindow.prototype.close.call(this);
  this.opened = false;
  this.marker.unhighlight();
};
