/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _IContainer ()
{
  _IObject.call (this);

  /**
   * Get list of all widgets
   */
  this.getContainer = function ()
    {
      return this.container;
    }

  /**
   * Add child widget
   */
  this.add = function (element)
    {
      this.container.push (element);
    };

  /**
   * Remove widget from container
   */
  this.remove = function (element)
    {
      var index = this.container.indexOf (element);
      if (index >= 0)
        {
          this.container.splice (index, 1);
        }
    };

  /**
   * Remove all items
   */
  this.clear = function ()
    {
      this.container = [];
    }

  /**
   * Get item by index
   */
  this.get = function (index)
    {
      return this.container[index];
    }
}

/***
 * Constructor
 */
function IContainer ()
{
  IObject.call (this);

  this.container = [];
}

IContainer.prototype = new _IContainer;
IContainer.prototype.constructor = IContainer;
