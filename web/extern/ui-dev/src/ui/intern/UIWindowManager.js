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
      if (window.dom && window.dom.parentNode)
        {
          /* window had been minimized */
          window.dom.style.display = '';

          window.onShow ();
          this.onWindowShown (window);

          this.focusWindow (window);
          this.raiseWindow (window);

          return;
        }

      if (isUnknown (viewport))
        {
          viewport = uiMainViewport;
        }

      var wnd = window.build ();
      var wndHolder = document.body;

      if (viewport)
        {
          wndHolder = viewport.getViewport ();
        }

      wndHolder.appendChild (wnd);
      window.viewport = viewport;

      this.add (window);

      window.onShow ();
      this.onWindowShown (window);

      this.raiseWindow (window);
    };

  /**
   * Focus specified window
   *
   * @param window - window to be focused
   */
  this.focusWindow = function (window)
    {
      var lastFocused = this.getLastFocused ();
      if (this.raiseOnFocus)
        {
          this.raiseWindow (window);
        }

      if (lastFocused)
        {
          lastFocused.dom.removeClass ('UIWindowFocused');
        }

      window.dom.addClass ('UIWindowFocused');

      remove (this.usageStack, window);
      this.usageStack.push (window);

      this.lastFocused = window;

      this.onWindowFocused (window);
    };

  /**
   * Raise specified window
   *
   * @param window - window to be raised
   */
  this.raiseWindow = function (window)
    {
      var oldIndex = window.dom.style.zIndex;

      if (oldIndex > 0 && oldIndex == uiMainZIndex.getLastIndex ())
        {
          window.onRaise ();
          this.onWindowRaised (window);

          return;
        }

      var index = uiMainZIndex.newIndex ();

      if (oldIndex)
        {
          uiMainZIndex.removeIndex ();
        }

      window.dom.style.zIndex = index;

      window.onRaise ();
      this.onWindowRaised (window);
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
      this.onWindowHidden (window);
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

      remove (this.usageStack, window);
      this.remove (window);

      this.hideWindow (window);
      this.removeWindow (window);

      window.onClosed ();
      this.onWindowClosed (window);
    }

  /**
   * Maximize specified window
   *
   * @param window - window to be maximized
   */
  this.maximizeWindow = function (window)
    {
      if (window.isMaximized)
        {
          return;
        }

      /* prepare animation */
      var top = parseInt (window.dom.style.top);
      var left = parseInt (window.dom.style.left);

      var width  = window.dom.offsetWidth;
      var height = window.dom.offsetHeight;

      var parent = window.dom.parentNode;
      var parentWidth  = parent.clientWidth;
      var parentHeight = parent.clientHeight;

      window.dom.style.bottom = parentHeight - top - height + 'px';
      window.dom.style.right  = parentWidth - left - width + 'px';

      window.dom.style.width  = 'auto';
      window.dom.style.height = 'auto';

      window.isMaximized = true;

      window.savedDims = {'width'  : width,
                          'height' : height,
                          'top'    : top,
                          'left'   : left};

      /* Animated expand */
      $(window.dom).animate ({'top'    : 0,
                              'left'   : 0,
                              'right'  : 0,
                              'bottom' : 0}, window.animateSpeed,
                              wrapMethDelayed (window, 'onMaximized'));

      this.onWindowMaximized (window);
    };

  /**
   * Restore size of specified window
   *
   * @param window - window to be restored
   */
  this.restoreWindow = function (window)
    {
      /* Prepare animation */
      window.dom.style.width  = window.dom.offsetWidth + 'px';
      window.dom.style.height = window.dom.offsetHeight + 'px';

      window.dom.style.bottom = '';
      window.dom.style.right  = '';

      window.isMaximized = false;

      $(window.dom).animate ({'top'    : window.savedDims['top'],
                              'left'   : window.savedDims['left'],
                              'width'  : window.savedDims['width'],
                              'height' : window.savedDims['height']}, window.animateSpeed,
                              wrapMethDelayed (window, 'onRestored'));

      this.onWindowRestored (window);
    };

  /**
   * Minimize specified window
   */
  this.minimizeWindow = function (window)
    {
      /* Hide window */
      window.dom.style.display = 'none';

      window.onMinimized ();
      this.onWindowMinimized (window);

      /* Find window to raise */
      remove (this.usageStack, window);
      this.usageStack.splice (0, 0, window);

      var lastFocused = this.getLastFocused ();
      if (lastFocused && this.isWindowVisible (lastFocused))
        {
          lastFocused.setFocus ();
        }
    };

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

  /**
   * Get last focused window
   */
  this.getLastFocused = function ()
    {
      if (this.usageStack.length)
        {
          var window = this.usageStack[this.usageStack.length - 1];
          if (window.isVisible ())
            {
              return window;
            }
        }

      return null;
    };

  /**
   * Check if window visible
   */
  this.isWindowVisible = function (window)
    {
      return window.isVisible ();
    }

  /** Event stubs  */
  this.onWindowRaised    = function (window) {};
  this.onWindowClosed    = function (window) {};
  this.onWindowShown     = function (window) {};
  this.onWindowHidden    = function (window) {};
  this.onWindowFocused   = function (window) {};
  this.onWindowMaximized = function (window) {};
  this.onWindowRestored  = function (window) {};
  this.onWindowMinimized = function (window) {};
}

function UIWindowManager ()
{
  IObject.call (this);
  IContainer.call (this);

  this.usageStack = []; /* ordered by last focus windows */

  this.raiseOnFocus = true;
}

UIWindowManager.prototype = new _UIWindowManager;
UIWindowManager.prototype.constructor = UIWindowManager;
