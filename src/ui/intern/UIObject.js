/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIObject ()
{
  IObject.call (this);

  /**
   * Get object's UI context
   */
  this.getUIContext = function ()
    {

    };
}

//UIObject.prototype = new UIObject;
UIObject.prototype.constructor = UIObject;
