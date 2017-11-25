/**
 * @description Represents a Place.
 * @constructor
 * @param {object} place - place properties
 * @returns {object} place with properties set as observables
 */

const Place = function(place) {
  const SELF = this;
  let hours = 'N/A';

  SELF.id = place.id;
  SELF.name = place.title;
  SELF.category = place.category.id;
  SELF.lat = place.position[0];
  SELF.lng = place.position[1];
  SELF.icon = place.icon;

  // if hours set save to place obj
  if (place.openingHours !== undefined) {
    hours = place.openingHours.text;
  }

  SELF.hours = hours;
  SELF.address = place.vicinity;
};
