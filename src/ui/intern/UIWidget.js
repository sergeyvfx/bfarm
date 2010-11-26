/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIWidgetPopup ()
{
  /**
   * Show popup object at specified point
   *
   * Point is an object with structure {x, y}
   */
  this.popupAt = function (point)
    {
      if (!this.dom)
        {
          this.build ();
        }

      return this.dom.popupAt (point);
    };


  /**
   * Hide popup
   */
  this.hidePopup = function ()
    {
      return this.dom.hidePopup ();
    };

  /**
   * Set z-index position
   */
  this.setPupZIndex = function (zIndex)
    {
      return this.dom.setPupZIndex (zIndex);
    };
};

function _UIWidget ()
{
  _UIObject.call (this);
  _UIWidgetPopup.call (this);

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

  /**
   * Get fill flag
   */
  this.getFill = function ()
    {
      return this.fill;
    };

  /**
   * set fill flag
   */
  this.setFill = function (fill)
    {
      this.fill = fill;
      this.rebuild ();
    };

  /****
   * Some DOM helpers
   */

  this.isEmbedded = function ()
    {
      if (!this.dom)
        {
          return false;
        }

      return isNodeEmbedded (this.dom);
    };

  /**
   * Is width specified (direct or indirect)
   */
  this.isWidthSet = function ()
    {
      return this.width != null || this.fill;
    };

  /**
   * Is height specified (direct or indirect)
   */
  this.isHeightSet = function ()
    {
      return this.height != null || this.fill;
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

          this.dom.addClass ('UIWidget');

          this.dom.uiWidget = this;

          if (marginStr)
            {
              this.dom.style.margin = marginStr;
            }

          if (!this.fill)
            {
              if (this.width != null)
                {
                  this.dom.style.width = uiUtil.sizeToStyle (this.width);
                }

              if (this.height != null)
                {
                  this.dom.style.height = uiUtil.sizeToStyle (this.height);
                }
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
              dom.removeClass (this.insensitiveClassName);
            }
          else
            {
              dom.addClass (this.insensitiveClassName);
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

  /**
   * Make some tweaks after embedding widget to container
   */
  this.postEmbedTweaks = function ()
    {
      if (!this.isEmbedded ())
        {
          return;
        }

      if (this.fill)
        {
          var p = $(this.dom.parentNode);
          var s = $(this.dom);

          if (!inside (p.css ('position'), ['absolute', 'relative']))
            {
              if (p[0] != document.body)
                {
                  p.css ('position', 'relative');
                }
            }

          s.css ('position', 'absolute');

          s.css ('top',    p.css ('paddingTop'));
          s.css ('bottom', p.css ('paddingBottom'));
          s.css ('left',   p.css ('paddingLeft'));
          s.css ('right',  p.css ('paddingRight'));

          s.css ('width',  'auto');
          s.css ('height', 'auto');
        }
    };

  this.getName = function ()
    {
      return this.name;
    };

  this.setName = function (name)
    {
      this.name = name;
    };

  this.lookupWidget = function (name)
    {
      if (this.name == name)
        {
          return this;
        }

      return null;
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

  /* Widget's name */
  this.name = opts['name'] || null;

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

  /* Should widget fill whole parent's client area? */
  this.fill   = defVal (opts['fill'], false);
}

UIWidget.prototype = new _UIWidget;
UIWidget.prototype.constructor = UIWidget;
