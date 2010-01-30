/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/***
 * Hack for sucky IE
 */
if (!window.Element)
{
  Element = function () {}

  var __createElement = document.createElement;
  document.createElement = function(tagName)
    {
      var element = __createElement(tagName);

      for (var key in Element.prototype)
        element[key] = Element.prototype[key];

      return element;
    }

  var __getElementById = document.getElementById
  document.getElementById = function(id)
    {
      var element = __getElementById(id);
      for(var key in Element.prototype)
        element[key] = Element.prototype[key];
      return element;
    }
}

/**
 * Get DOM element's absolute position
 */
Element.prototype.offset = function ()
{
  return $(this).offset ();
};

/****
 * Implement IUIMovable methods on Elements
 *
 * This is useful for DOM element moving
 */

/**
 * Move DOM element by given coordinates deltas
 */
Element.prototype.moveBy = function (delta)
{
  if (this.style.position != 'absolute' ||
      !('' + this.style.left).match (/px$/) ||
      !('' + this.style.top).match (/px$/))
    {
      var pos = this.offset ();
      this.style.position = 'absolute';

      this.style.left = pos['left'] + 'px';
      this.style.top  = pos['top'] + 'px';
    }

  this.style.left = parseInt (this.style.left || '0') + delta['x'] + 'px';
  this.style.top = parseInt (this.style.top || '0') + delta['y'] + 'px';
}

/**
 * Get area, by which DOM element could be moved
 */
Element.prototype.getMoveArea = function ()
{
  return this;
}

/**
 * Stubs
 */
Element.prototype.onBeginMove = function () {}
Element.prototype.onEndMove = function () {}

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

/***
 * Stubs
 */

/**
 * IUIResizable stubs
 */
Element.prototype.onEndResize = function () {}
