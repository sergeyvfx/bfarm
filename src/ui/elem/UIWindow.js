/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIWindow ()
{
  _UIContainer.call (this);

  /**
   * Build all widgets
   */
  this.buildWidgets = function ()
    {
      this.clientArea.removeAllNodes ();

      for (var i = 0, n = this.container.length; i < n; ++i)
        {
          var dom = this.container[i].build ();
          this.clientArea.appendChild (dom);
        }
    };

  /**
   * Build DOM tree
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');
  
      result.className = 'UIWindow';
  
      /* Title */
  
      /* Background and shadow */
      var titleBg = createElement ('DIV');
      var span = createElement ('SPAN');
      titleBg.className = 'UIWindowTitleBg';
      span.appendChild (document.createTextNode (this.caption));
      titleBg.appendChild (span);
      result.appendChild (titleBg);
  
      /* Title */
      var title = createElement ('DIV');
      title.className = 'UIWindowTitle';
      title.appendChild (document.createTextNode (this.caption));
      result.appendChild (title);
  
      if (this.resizable)
        {
          var sizer = createElement ('DIV');
          sizer.className = 'UIWindowSizer';
          result.appendChild (sizer);
  
          UI_MakeResizable (result, {'resizeArea': sizer});
        }
  
      /* Client area */
      var clientArea = createElement ('DIV');
      clientArea.className = 'UIWindowClient';
      result.appendChild (clientArea);
  
      /* Set window position */
      result.style.top  = this.top + 'px';
      result.style.left = this.left + 'px';
  
      /* Set window dimensions */
      result.style.width  = this.width + 'px';
      result.style.height = this.height + 'px';
  
      UI_MakeMovable (result, {'moveArea': title});
  
      /* Store DOM elements */
      this.titleBg    = titleBg;
      this.title      = title;
      this.sizer      = sizer;
      this.clientArea = clientArea;

      uiManager.registerContext (result);
      $(result).click (function (self) { return function () { self.setFocus (); } } (this));

      /* Build widgets */
      this.buildWidgets ();

      return result;
    };

  /**
   * Set focus to window
   */
  this.setFocus = function ()
    {
      uiWindowManager.focusWindow (this);
      this.onFocus ();
    };

  /**
   * Raise window
   */
  this.raise = function ()
    {
      uiWindowManager.raiseWindow (this);
      this.onRaise ();
    };

  /**
   * Show window
   *
   * @param viewPort - viewport where window will be shown
   */
  this.show = function (viewPort)
    {
      uiWindowManager.showWindow (this, viewPort);
      this.onShow ();
    };

  /**
   * Hide window
   */
  this.hide = function ()
    {
      uiWindowManager.hideWindow (this);
      this.onHide ();
    };

  /**
   * Close window
   */
  this.close = function ()
    {
      uiWindowManager.closeWindow (this);
      this.onClose ();
    };

  /* Getters/setters */

  /**
   * Get client area
   */
  this.getClientArea =  function ()
    {
      return this.clientArea;
    };

  /* Event stubs */
  this.onShow = function () {};
  this.onRaise = function () {};
  this.onHide = function () {};
  this.onClose = function () {};
}

/****
 * Constructor
 */
function UIWindow (opts)
{
  opts = opts || {};
  UIContainer.call (this, opts);

  this.caption = opts['caption'] || '';

  /* Window position */
  this.top = opts['top'] || 0;
  this.left = opts['left'] || 0;

  /* Width of window */
  this.width = opts['width'] || 320;

  /* Height of window */
  this.height = opts['height'] || 240;

  this.resizable = true;
  if (!isUnknown (opts['resizable']))
    {
      this.resizable = isTruth (opts['resizable']);
    }

  this.titleBg    = null;  /* Title background */
  this.title      = null;  /* Title */
  this.sizer      = null;  /* Resizer element */
  this.clientArea = null;  /* Client area */

  uiManager.addHandler (['mousedownCancel', 'clickCancel'], function (self) {
    return function (userData) {
      if (userData['context'] == self.dom)
        {
          self.setFocus ();
        }
    };
  } (this));
}

UIWindow.prototype = new _UIWindow;
UIWindow.prototype.constructor = UIWindow;
