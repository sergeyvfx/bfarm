/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

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
  if (!delta['x'] && !delta['y'])
    {
      return;
    }

  var absolute = this.style.position == 'absolute';

  if (!absolute)
    {
      absolute = $(this).css ('position') == 'absolute';
    }

  if (!absolute || !('' + this.style.left).match (/px$/) ||
      !('' + this.style.top).match (/px$/))
    {
      this.style.left = this.offsetLeft + 'px';
      this.style.top  = this.offsetTop + 'px';
      this.style.position = 'absolute';
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
