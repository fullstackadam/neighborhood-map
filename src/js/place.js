/**
 * @description Represents a Place.
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