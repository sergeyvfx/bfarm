/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIObject ()
{
  _IObject.call (this);

  /**
   * Get object's UI context
   */
  this.getUIContext = function ()
    {

    };
}

function UIObject ()
{
  IObject.call (this);
}

UIObject.prototype = new _UIObject;
UIObject.prototype.constructor = UIObject;
