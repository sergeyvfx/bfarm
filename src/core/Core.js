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
Element.prototype.getAbsolutePosition = function ()
{
  return getElementAbsolutePos (this);
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
  if (this.style.position != 'absolute')
    {
      var pos = this.getAbsolutePosition ();
      this.style.position = 'absolute';

      this.style.left = pos['x'] + 'px';
      this.style.top  = pos['y'] + 'px';
    }

  this.style.left = parseInt (this.style.left) + delta['x'] + 'px';
  this.style.top = parseInt (this.style.top) + delta['y'] + 'px';
}

/**
 * Get area, by which DOM element could be moved
 */
Element.prototype.getMoveArea = function ()
{
  return this;
}

Element.prototype.onBeginMove = function ()
{
  this.style.__zIndex = this.style.zIndex;
  this.style.zIndex = '1000';
}

Element.prototype.onEndMove = function ()
{
  this.style.zIndex = this.style.__zIndex;
}
