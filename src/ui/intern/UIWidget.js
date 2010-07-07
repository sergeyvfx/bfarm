/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIWidget ()
{
  _UIObject.call (this);

  /****
   * Properties getters/setters
   */

  /**
   * Get widget's parent
   */
  this.getParent = function ()
    {
      return this.parent;
    }

  /**
   * Set widget's parent
   */
  this.setParent = function (parent)
    {
      this.parent = parent;
      this.onParentChanged ()
    };

  /**
   * Get widget's visibility flag
   */
  this.getVisible = function ()
    {
      return this.visible;
    };

  /**
   * Set widget's visibility flag
   */
  this.setVisible = function (visible)
    {
      this.visible = visible;
      this.onVisibleChanged ()
      this.rebuild ();
    };

  /**
   * Get widget's sensitive flag
   */
  this.getSensitive = function ()
    {
      return this.sensitive;
    };

  /**
   * Set widget's sensitive flag
   */
  this.setSensitive = function (sensitive)
    {
      this.sensitive = sensitive;
      this.onSensitiveChanged ();

      if (!this.handleSensitive ())
        {
          this.rebuild ();
        }
    };

  /**
   * Get widget margin
   */
  this.getMargin = function ()
    {
      return this.margin;
    };

  /**
   * Set widget margin
   */
  this.setMargin = function (margin)
    {
      this.margin = margin;

      if (this.dom)
        {
          this.rebuild ();
        }
    };

    this.getMargin = function ()
    {
      return this.margin;
    };

  /**
   * Set widget height
   */
  this.setHeight = function (heigth)
    {
      this.height = height;

      if (this.dom)
        {
          this.rebuild ();
        }
    };

  /**
   * Set widget width
   */
  this.setWidth = function (width)
    {
      this.width = eidth;

      if (this.dom)
        {
          this.rebuild ();
        }
    };

  /****
   * DOM functions
   */

  /**
   * Build widget's DOM and return it
   */
  this.doBuild = function () {};

  this.build = function ()
    {
      if (!this.visible)
        {
          return null;
        }

      if (!this.dom)
        {
          this.dom = this.doBuild ();
        }

      if (this.dom)
        {
          var marginStr = getSpacingStr (this.margin);
          if (marginStr)
            {
              this.dom.style.margin = marginStr;
            }

          if (this.width != null)
            {
              this.dom.style.width = uiUtil.sizeToStyle (this.width);
            }

          if (this.height != null)
            {
              this.dom.style.height = uiUtil.sizeToStyle (this.height);
            }
        }

      this.attachStoppers ();
      this.handleSensitive ();

      return this.dom;
    };

  /**
   * Rebuild DOM tree
   */
  this.rebuild = function ()
    {
      var oldDOM = this.dom;

      this.dom = null;
      var newDOM = this.build ();

      if (oldDOM && oldDOM.parentNode)
        {
        oldDOM.parentNode.replaceChild (newDOM, oldDOM);
        }
    };

  /****
   * Properties changes handler's stubs
   */
  this.onParentChanged = function () {};
  this.onVisibleChanged = function () {};
  this.onSensitiveChanged = function () {};
  this.onFocus = function () {};

  /**
   * Set focus to widget
   */
  this.setFocus = function () {
    if (this.focusDOM)
      {
        try
          {
            this.focusDOM.focus ();
          }
        catch (e)
          {
          }
      }

    this.onFocus ();
  };

  /***
   * DOM events
   */

  this.attachEvent = function (element, event, handlerName)
    {
      var handler;

      if (typeof handlerName == 'string')
        {
          handler = function (self, handlerName) { return function (event) {
                if (self[handlerName])
                  {
                    self[handlerName] (event);
                  }
              }
            } (this, handlerName);
        }
      else
        {
          handler = handlerName;
        }

      $(element) [event] (handler);
    };

  /**
   * Attach stoppers of events, which widget doesn't want
   * to bubble to it's parent
   */
  this.attachStoppers = function ()
    {
      if (!this.dom)
        {
         /* There is no DOM node to attach events to */
         return;
        }

      for (var i = 0, n = this.stopEvents.length; i < n; ++i)
        {
          var event = this.stopEvents[i];
          $(this.dom)[event] (stopEvent);
        }
    };

  /**
   * Handle sensitive attribute
   */
  this.handleSensitive  = function (dom)
    {
      if (this.insensitiveClassName != null)
        {
          dom = dom || this.dom;

          if (!dom)
            {
              return;
            }

          if (this.sensitive)
            {
              $(dom).removeClass (this.insensitiveClassName);
            }
          else
            {
              $(dom).addClass (this.insensitiveClassName);
            }

          return true;
        }

      return false;
    };

  /**
   * Destroy DOM subtree
   */
  this.destroyDOM = function ()
    {
      if (this.dom)
        {
          /* ensure widget's DOM isn't in document's DOM */
          removeNode (this.dom);

          delete this.dom;
          this.dom = null;
        }
    };
}

/***
 * Constructor
 */
function UIWidget (opts)
{
  opts = opts || {};
  UIObject.call (this);

  /* List of attached events */
  this.events = [];

  /* Widget's parent */
  this.parent = opts['parent'] || null;

  /* Is widget visible */
  this.visible = defVal (opts['visible'], true);

  /* Is widget sensitive */
  this.sensitive = defVal (opts['sensitive'], true);

  this.dom = null;       /* DOM-tree */
  this.focusDOM = null;  /* DOM element for setting focus */

  /* List of events, which soudn't been bubbled */
  this.stopEvents = [];

  /* Class name for insensitive widget */
  this.insensitiveClassName = null;

  /* Margin from widget */
  this.margin = defVal (opts['margin'], null);

  /* Widget's dimensions */
  this.height = defVal (opts['height'], null);
  this.width  = defVal (opts['width'], null);
}

UIWidget.prototype = new _UIWidget;
UIWidget.prototype.constructor = UIWidget;
