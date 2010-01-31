/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/****
 * Implement IUIPopup methods on Elements
 *
 * This is useful for DOM element pop-upping
 */

/**
 * Popup DOM element at specified point
 */
Element.prototype.popupAt = function (point)
{
  this.style.position = 'absolute';
  this.style.left = point.x + 'px';
  this.style.top = point.y + 'px';
  this.style.display = 'block';
}

/**
 * Hide popupped DOM element
 */
Element.prototype.hidePopup = function ()
{
  this.style.display = 'none';
}
