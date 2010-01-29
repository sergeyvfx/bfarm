/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function IUIResizable ()
{
  /**
   * Move object by given coordinates deltas
   *
   * @param delta = object with fields x and y
   */
  this.resizeBy = function (delta)
    {
    };

  /**
   * Object started resizing event handler
   */
  this.onBeginResize = function ()
    {
    };

  /**
   * Object finished resizing event handler
   */
  this.onEndMove = function ()
    {
    };

  /**
   * Get area, by which object could be resized
   *
   * Area should be a DOM element or list of DOM elements
   */
  this.getResizeArea = function ()
    {
    };

  /**
   * Validate resizing delta
   *
   * Could be null or function, which receives validated delta
   */
  this.validateResizeDelta = null;
}

IUIResizable.prototype = new IUIResizable;
IUIResizable.prototype.constructor = IUIResizable;

function UIResizeManager ()
{
  UIDragProvider.call (this);

  this.handleDelta = function (delta)
    {
      /* Validate delta, by which user tries to resize object */
      if (this.activeObject.validateResizeDelta)
        {
          delta = this.movingObject.validateResizeDelta (delta);
        }

      this.activeObject.resizeBy (delta);
    };

  /* Name of key of opts which holds area for begin dragging */
  this.optAreaName = 'resizeArea';

  /* Name of getter for dragging area */
  this.areaGetter = 'getResizeArea';

  /* Name of method for handling drag beginning */
  this.beginDragMethod = 'onBeginResize';

  /* Name of method for handling drag finishing */
  this.endDragMethod = 'onEndResize';
}

UIResizeManager.prototype = new UIDragProvider;
UIResizeManager.prototype.constructor = UIMoveManager;

var uiResizeManager = new UIResizeManager;

/**
 * Register new moveble object
 *
 * Object should implement IUIMovable methods
 */
function UI_MakeResizable(object, opts)
{
  uiResizeManager.register (object, opts);
}
