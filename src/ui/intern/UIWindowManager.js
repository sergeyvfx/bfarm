/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/**
 * Windows' manager
 */
function _UIWindowManager ()
{
  _IObject.call (this);

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
    };

  /**
   * Hide specified window
   *
   * @param window - window to be hidden
   */
  this.hideWindow = function (window)
    {
      window.viewport.getViewport ().removeChild (window.dom);
      window.viewport = null;
    }
}

function UIWindowManager ()
{
  IObject.call (this);

  this.raiseOnFocus = true;
}

UIWindowManager.prototype = new _UIWindowManager;
UIWindowManager.prototype.constructor = UIWindowManager;

var uiWindowManager = new UIWindowManager();
