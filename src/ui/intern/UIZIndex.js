/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIZIndex ()
{
  _IObject.call (this);

  /**
   * Get last used index
   *
   * @return last used index
   */
  this.getLastIndex = function ()
    {
      var last = 0;

      for (var i = 0, n = this.indexes.length; i < n; ++i)
        {
          if (this.indexes[i] > last)
            {
              last = this.indexes[i];
            }
        }

      return last;
    };

  /**
   * Add used index
   *
   * @param index - index to be added
   */
  this.addIndex = function (index)
    {
      this.indexes.push (index);
    };

  /**
   * Remove index
   *
   * @param index - index to be removed
   */
  this.removeIndex = function (index)
    {
      var i = this.indexes.indexOf (index);

      if (i >= 0)
        {
          this.indexes.splice (i, 1);
        }
    };

  /**
   * Get new zIndex
   *
   * @reutrn new zIndex
   */
  this.newIndex = function ()
    {
      var index = this.getLastIndex () + 1;

      this.addIndex (index);

      return index;
    };
}

function UIZIndex ()
{
  IObject.call (this);

  this.indexes = [];
}

UIZIndex.prototype = new _UIZIndex;
UIZIndex.prototype.constructor = UIZIndex;
