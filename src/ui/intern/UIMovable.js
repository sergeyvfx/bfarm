/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _IUIMovable ()
{
  /**
   * Move object by given coordinates deltas
   *
   * @param delta = object with fields x and y
   */
  this.moveBy = function (delta)
    {
    };

  /**
   * Object started moving event handler
   */
  this.onBeginMove = function ()
    {
    };

  /**
   * Object finished moving event handler
   */
  this.onEndMove = function ()
    {
    };

  /**
   * Get area, by which object could be moved
   *
   * Area should be a DOM element or list of DOM elements
   */
  this.getMoveArea = function ()
    {
    };

  /**
   * Validate moving delta
   *
   * Could be null or function, which receives validated delta
   */
  this.validateMoveDelta = null;
}

function IUIMovable ()
{
}

IUIMovable.prototype = new _IUIMovable;
IUIMovable.prototype.constructor = IUIMovable;

function _UIMoveManager ()
{
  _UIDragProvider.call (this);

  this.handleDelta = function (delta)
    {
      /* Validate delta, by which user tries to move object */
      if (this.activeObject.validateMoveDelta)
        {
          delta = this.movingObject.validateMoveDelta (delta);
        }

      this.activeObject.moveBy (delta);
    };
}

function UIMoveManager ()
{
  UIDragProvider.call (this);

  /* Name of key of opts which holds area for begin dragging */
  this.optAreaName = 'moveArea';

  /* Name of getter for dragging area */
  this.areaGetter = 'getMoveArea';

  /* Name of method for handling drag beginning */
  this.beginDragMethod = 'onBeginMove';

  /* Name of method for handling drag finishing */
  this.endDragMethod = 'onEndMove';
}

UIMoveManager.prototype = new _UIMoveManager;
UIMoveManager.prototype.constructor = UIMoveManager;

var uiMoveManager = new UIMoveManager;

/**
 * Register new moveble object
 *
 * Object should implement IUIMovable methods
 */
function UI_MakeMovable(object, opts)
{
  uiMoveManager.register (object, opts);
}
