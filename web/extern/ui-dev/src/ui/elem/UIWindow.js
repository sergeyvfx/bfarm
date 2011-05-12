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
          var dom = uiUtil.getItemDOM (this.container[i]);
          this.clientArea.appendChild (dom);
        }
    };

  /**
   * Create new button in title bar
   *
   * @param title - button's title
   * @param pos - position (left or right)
   * @param handler - click handler
   */
  this.buildTitleButton = function (image, title, pos, className, handler)
    {
      var button = createElement ('DIV');
      pos = '' + defVal (pos, 'left');
      image = '' + defVal (image, '');

      if (pos.toLowerCase() == 'left')
        {
          pos = 'Left';
        }
      else
        {
          pos = 'Right';
        }

      button.className = 'UIWindowTitleButton UIWindowTitleButton' + pos;
      if (className)
        {
          $(button).addClass (className);
        }

      if (image == '')
        {
          button.appendChild (createTextNode (title));
        }

      if (handler)
        {
          /* Need this to prevent dnd stuff starting working on button's click */
          var stopCb = function (event) {stopEvent (event); };
          $(button).mousedown (stopCb);
          $(button).dblclick  (stopCb);

          $(button).click (function (handler) {return function () {
                  window.setTimeout (handler, 10);
                };
              } (handler));
        }

      if (image)
        {
          /*
           * TODO: Fix this to add support of full url
           */
          var src = UI_PREFIX + 'pics/elem/' + image + '.gif';

          var img = createElement ('IMG');
          img.src = src;
          img.title = title;

          button.appendChild (img);
        }

      this.titleButtons.appendChild (button);
    };

  /**
   * Build default buttons in title bar
   */
  this.buildDefaultButtons = function ()
    {
      if (this.menu.length ())
        {
          this.buildTitleButton ('window-menu', 'menu', 'left', 'UIWindowMenuButton',
              wrapMeth (this, 'onMenuClick'));
        }

      if (indexOf (this.buttons, 'CLOSE') >= 0)
        {
          this.buildTitleButton ('window-close', 'close', 'right', 'UIWindowCloseButton',
              wrapMeth (this, 'onCloseClick'));
        }

      if (indexOf (this.buttons, 'MAXIMIZE') >= 0)
        {
          this.buildTitleButton ('window-maximize', 'maximize', 'right', 'UIWindowMaximizeButton',
            wrapMeth (this, 'onToggleMaximizeClick'));
        }

      if (indexOf (this.buttons, 'MINIMIZE') >= 0 && !this.isModal ())
        {
          this.buildTitleButton ('window-minimize', 'minimize', 'right', 'UIWindowMinimizeButton',
              wrapMeth (this, 'onMinimizeClick'));
        }
    };

  /**
   * Customize handlers needed for UIMovable
   */
  this.customizeUIMovableHandlers = function (dom)
    {
      dom.moveBy = function (self, origHandler) {return function (delta) {
            if (self.isMaximized)
              {
                return;
              }

            origHandler.call (this, delta);
          }
        } (this, dom.moveBy);

      dom.validateMoveDelta = function (delta) {
        var vp = window;
        var wnd = this.uiWidget;
        var x = this.offsetLeft;
        var y = this.offsetTop;
        var w = this.offsetWidth;
        var h = wnd.titleBg.offsetHeight;

        if (wnd.viewport)
          {
            vp = wnd.viewport.getViewport ();
          }

        /* Horisontal limits */
        if (x + delta['x'] < 0)
          {
            delta['x'] = -x;
          }

        if (x + delta['x'] + w > $(vp).width ())
          {
            delta['x'] = $(vp).width () - x - w;
          }

        /* vertical limits */
        if (y + delta['y'] < 0)
          {
            delta['y'] = -y;
          }

        if (y + delta['y'] + h > $(vp).height ())
          {
            delta['y'] = $(vp).height () - y - h;
          }

        return delta;
      };
    };

  /**
   * Customize handlers needed for UIMovable
   */
  this.customizeUIResizableHandlers = function (dom)
    {
      dom.validateResizeDelta = function (delta) {
        var wnd = this.uiWidget;
        var w = this.offsetWidth;
        var h = this.offsetHeight;

        if (wnd.isMaximized)
          {
            return {'x': 0, 'y': 0};
          }

        if (w + delta['x'] < wnd.minWidth)
          {
            delta['x'] = wnd.minWidth - w;
          }

        if (h + delta['y'] < wnd.minHeight)
          {
            delta['y'] = wnd.minHeight - h;
          }

        return delta;
      };

      dom.resizeBy = function (self, origHandler) {return function (delta) {
            origHandler.call (dom, delta);
            self.onResize (delta);
          }
        } (this, dom.resizeBy);
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
      span.appendChild (createTextNode (this.title));
      titleBg.appendChild (span);
      result.appendChild (titleBg);

      /* Title */
      var title = createElement ('DIV');
      title.className = 'UIWindowTitle';
      title.appendChild (createTextNode (this.title));
      result.appendChild (title);

      $(title).disableTextSelect ();
      $(titleBg).disableTextSelect ();

      /* Title buttons */
      var buttons = createElement ('DIV');
      buttons.className = 'UIWindowTitleButtons';
      title.appendChild (buttons);

      if (this.resizable)
        {
          var sizer = createElement ('DIV');
          sizer.className = 'UIWindowSizer';
          result.appendChild (sizer);

          UI_MakeResizable (result, {'resizeArea': sizer});
          this.customizeUIResizableHandlers (result);
        }

      /* Client area */
      var clientArea = createElement ('DIV');
      clientArea.className = 'UIWindowClient';
      result.appendChild (clientArea);

      /* Set window position */
      if (this.position == 'center')
        {
          var vp = window;

          if (this.viewport)
            {
              this.viewport.getViewport ();
            }

          if (vp)
            {
              result.style.left = $(vp).scrollLeft() + Math.floor(($(vp).width() - this.width) / 2) + 'px';
              result.style.top  = $(vp).scrollTop() + Math.floor(($(vp).height() - this.height) / 2) + 'px';
            }
          else
            {
              /* actually, should not happen */
              result.style.top  = this.top + 'px';
              result.style.left = this.left + 'px';
            }
        }
      else
        {
          result.style.top  = this.top + 'px';
          result.style.left = this.left + 'px';
        }

      /* Set window dimensions */
      result.style.width  = this.width + 'px';
      result.style.height = this.height + 'px';

      UI_MakeMovable (result, {'moveArea': title});
      this.customizeUIMovableHandlers (result);

      /* set handlers */
      $(title).dblclick(wrapMeth (this, 'onToggleMaximizeClick'));
      $(title).rightMouseDown (function (self) { return function (event) {
            self.onTitleRightClick (event);
          };
        } (this));

      /* Store DOM elements */
      this.titleBg    = titleBg;
      this.titleFg    = title;
      this.sizer      = sizer;
      this.clientArea = clientArea;
      this.titleButtons = buttons;

      this.buildDefaultButtons ();

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
    };

  /**
   * Hide window
   */
  this.hide = function ()
    {
      uiWindowManager.hideWindow (this);
    };

  /**
   * Close window
   */
  this.close = function ()
    {
      uiWindowManager.closeWindow (this);
    };

  /**
   * Maxinize window
   */
  this.maximize = function ()
    {
      uiWindowManager.maximizeWindow (this);
    };

  /**
   * Restore window size
   */
  this.restore = function ()
    {
      uiWindowManager.restoreWindow (this);
    };

  /**
   * Miminize window
   */
  this.minimize = function ()
    {
      uiWindowManager.minimizeWindow (this);
    };

  /* Getters/setters */

  /**
   * Get client area
   */
  this.getClientArea =  function ()
    {
      return this.clientArea;
    };

  /**
   * Get window menu
   */
  this.getMenu = function ()
    {
      return this.menu;
    };

  /**
   * Get window title
   */
  this.getTitle = function ()
    {
      return this.title;
    };

  /* Handlers */

  /**
   * Handler of close title button
   */
  this.onCloseClick = function ()
    {
      this.close ();
    };

  /**
   * Handler of maximize title button
   */
  this.onToggleMaximizeClick = function ()
    {
      if (indexOf (this.buttons, 'MAXIMIZE') < 0)
        {
          return;
        }

      if (this.isMaximized)
        {
          this.restore ();
        }
      else
        {
          this.maximize ();
        }
    };

  /**
   * Handler of menu button click
   */
  this.onMenuClick = function (atPoint)
    {
      var point = defVal (atPoint, {'x': 0, 'y': 0});
      var offset = this.dom.offset ();

      if (isUnknown (atPoint))
        {
          point['x'] = offset['left'];
          point['y'] = offset['top'] + $(this.titleBg).height ();
        }

      uiPopupManager.popup (this.menu, point);
    };

  /**
   * Handle right click on title
   */
  this.onTitleRightClick = function (event)
    {
      /* XXX: ocffset {1,1} is needed to prevent intersection of new DOM with
              mouse pointer -- default context menu would be displayed in this case */

      if (this.menu.length ())
        {
          this.onMenuClick ({'x': event.clientX + 1, 'y': event.clientY + 1});
        }
    };

  /**
   * Handler of minimize title button
   */
  this.onMinimizeClick = function ()
    {
      this.minimize ();
    }

  /**
   * CHeck if window visible
   */
  this.isVisible = function ()
    {
      if (!this.dom)
        {
          return false;
        }

      if (!this.dom.parentNode)
        {
          return false;
        }

      if (this.dom.style.display == 'none')
        {
          return false;
        }

      return true;
    };

  this.isModal = function ()
    {
      return this.modal;
    };

  this.getAnimated = function ()
    {
      return this.animated;
    };

  this.setAnimated = function (animated)
    {
      this.animated = animated;
    };

  this.resizeTo = function(width, height, keepCenter)
    {
      var anim = {'width'  : width,
                  'height' : height};


      if (keepCenter)
        {
          var left = this.dom.offsetLeft;
          var top = this.dom.offsetTop;
          var cur_width = this.dom.clientWidth;
          var cur_height = this.dom.clientHeight;

          anim['left'] = left + (cur_width - width) / 2;
          anim['top'] = top + (cur_height - height) / 2;
        }

      if (this.isMaximized)
        {
          this.savedDims = anim;

          return;
        }

      if (this.animated)
        {
          $(this.dom).animate (anim, this.animateSpeed,
                               wrapMethDelayed (this, 'onResize'));
        }
      else
        {
          if (keepCenter)
            {
              this.dom.style.left = anim['left'] + 'px';
              this.dom.style.top = anim['top'] + 'px';
            }

          this.dom.style.width = anim['width'] + 'px';
          this.dom.style.height = anim['height'] + 'px';

          callOut (this.onResize);
        }
    };

  /* Event stubs */
  this.onShow   = function () {};
  this.onRaise  = function () {};
  this.onHide   = function () {};
  this.onClose  = function () {};
  this.onClosed = function () {};
  this.onResize = function (delta) {};
  this.onMaximized = function () {};
  this.onRestored  = function () {};
  this.onMinimized = function () {};
}

/****
 * Constructor
 */
function UIWindow (opts)
{
  opts = opts || {};
  UIContainer.call (this, opts);

  this.title = opts['title'] || '';

  /* Window position */
  this.top = opts['top'] || 0;
  this.left = opts['left'] || 0;

  /* Width of window */
  this.width = defVal (opts['width'], 320);

  /* Height of window */
  this.height = defVal (opts['height'], 240);

  /* Minimal width of window */
  this.minWidth = defVal (opts['minWidth'], 120);

  /* Minimal height of window */
  this.minHeight = defVal (opts['minHeight'], 90);

  /* Window is modal */
  this.modal = defVal (opts['modal'], false);

  /* Use animation for window */
  this.animated = defVal (opts['animated'], true);

  /* Initial window position */
  this.position = defVal (opts['position'], 'fixed');

  this.resizable = defVal (opts['resizable'], true);

  if (!isUnknown (opts['resizable']))
    {
      this.resizable = isTruth (opts['resizable']);
    }

  this.menu       = new UIMenu ();  /* Window menu */

  this.titleBg    = null;  /* Title background */
  this.titleFg    = null;  /* Title */
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

  this.buttons = defVal(opts['buttons'], ['MINIMIZE', 'MAXIMIZE', 'CLOSE']);

  /* Internal use */
  this.abortClose   = false;
  this.isMaximized  = false;
  this.animateSpeed = 100;

  this.events = this.events.concat (['onShow', 'onHide', 'onRaise', 'onClose', 'onCLosed',
                                     'onResize', 'onMaximized', 'onRestored', 'onMimimized']);
}

UIWindow.prototype = new _UIWindow;
UIWindow.prototype.constructor = UIWindow;
