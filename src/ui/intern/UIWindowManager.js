/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/**
 * Windows' manager
 */
function _UIWindowManager ()
{
  _IContainer.call (this);

  /**
   * Show specified window
   *
   * @param window - window to be shown
   * @param vewport - viewport where window will be shown
   */
  this.showWindow = function (window, viewport)
    {
      if (isUnknown (viewport))
        {
          viewport = uiMainViewport;
        }

      var wnd = window.build ();
      viewport.getViewport ().appendChild (wnd);

      window.viewport = viewport;

      window.onShow ();

      this.raiseWindow (window);
    };

  /**
   * Focus specified window
   *
   * @param window - window to be focused
   */
  this.focusWindow = function (window)
    {
      if (this.raiseOnFocus)
        {
          this.raiseWindow (window);
        }
    };

  /**
   * Raise specified window
   *
   * @param window - window to be raised
   */
  this.raiseWindow = function (window)
    {
      var viewport = window.viewport;

      if (!viewport)
        {
          return;
        }

      var zIndex = viewport.getZIndex ();
      var oldIndex = window.dom.style.zIndex;

      if (oldIndex > 0 && oldIndex == zIndex.getLastIndex ())
        {
          return;
        }

      var index = zIndex.newIndex ();

      if (oldIndex)
        {
          zIndex.removeIndex ();
        }

      window.dom.style.zIndex = index;

      window.onRaise ();
    };

  /**
   * Hide specified window
   *
   * @param window - window to be hidden
   */
  this.hideWindow = function (window)
    {
      removeNode (window.dom);
      window.viewport = null;

      window.onHide ();
    }

  /**
   * Close specified window
   *
   * @param window - window to be closed
   */
  this.closeWindow = function (window)
    {
      window.abortClose = false;
      window.onClose ();

      if (window.abortClose)
        {
          return;
        }

      this.hideWindow (window);
      this.removeWindow (window);

      window.onClosed ();
    }

  /* setters/getters */

  /**
   * Get all management windows
   */
  this.getWindows = function ()
    {
      return this.getContainer ();
    };

  /**
   * Add new management window
   */
  this.addWindow = function (window)
    {
      this.add (window);
    };

  /**
   * Remove management window
   */
  this.removeWindow = function (window)
    {
      this.remove (window);
    };
}

function UIWindowManager ()
{
  IObject.call (this);
  IContainer.call (this);

  this.windows = [];
  this.raiseOnFocus = true;
}

UIWindowManager.prototype = new _UIWindowManager;
UIWindowManager.prototype.constructor = UIWindowManager;

var uiWindowManager = new UIWindowManager();
