/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/**
 * Interface for all objects
 *
 * All generated classes should implements this interface
 */
function IObject ()
{
  /**
   * Object's destrucctor
   */
  this.destroy = function ()
    {
    };

  /**
   * Contructor is going here
   */
}


//IObject.prototype = new IObject;
IObject.prototype.constructor = IObject;
