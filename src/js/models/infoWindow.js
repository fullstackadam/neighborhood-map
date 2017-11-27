/**
 * @description Represents a map InfoWindow.
 * @constructor
 * @param {object} marker
 * @returns {object} InfoWindow
 */

function InfoWindow(marker) {
  this.marker = marker;

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
}

InfoWindow.prototype = Object.create(google.maps.InfoWindow.prototype);

// https://github.com/angular-ui/angular-google-maps/issues/606
InfoWindow.prototype.opened = false;

// build template for infowindow content
InfoWindow.prototype.html = function(name, address, hours) {
  const HTML = `<h3> ${name}</h3>` +
    `<p><strong>Address:</strong> ${address}</p>` +
    `<p><strong>Hours:</strong> ${hours}</p>`;

  return HTML;
};


// open infowindow and save state
InfoWindow.prototype.open = function() {
  google.maps.InfoWindow.prototype.open.call(
    this,
    this.marker.map,
    this.marker
  );

  this.opened = true;
};

// close infowindow and save state
InfoWindow.prototype.close = function() {
  google.maps.InfoWindow.prototype.close.call(this);
  this.opened = false;
};
