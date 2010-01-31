/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/****
 * Implement IUIResize methods on Elements
 *
 * This is useful for DOM element resizing
 */

/**
 * Resize DOM element by given coordinates deltas
 */
Element.prototype.resizeBy = function (delta)
{
  this.style.width = parseInt (this.style.width || '0') + delta['x'] + 'px';
  this.style.height = parseInt (this.style.height || '0') + delta['y'] + 'px';
}

Element.prototype.onBeginResize = function ()
{
  this.style.width = this.offsetWidth + 'px';
  this.style.height = this.offsetHeight + 'px';
}

/**
 * Get area, by which DOM element could be resized
 */
Element.prototype.getResizeArea = function ()
{
  return null;
}

/**
 * IUIResizable stubs
 */
Element.prototype.onEndResize = function () {}
