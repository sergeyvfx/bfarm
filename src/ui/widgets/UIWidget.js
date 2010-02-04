/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIWidget (opts)
{
  UIObject.call (this);

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
      this.rebuild ();
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
      this.dom = this.doBuild ();
      return this.dom;
    };

  /**
   * Rebuild DOM tree
   */
  this.rebuild = function ()
    {
      /**
       * TODO: Need to implement
       */
    };

  /****
   * Properties changes handler's stubs
   */
  this.onParentChanged = function () {};
  this.onVisibleChanged = function () {};
  this.onSensitiveChanged = function () {};

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
  };

  /***
   * DOM events
   */

  this.atttachEvent = function (element, event, handlerName)
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

  /***
   * Constructor
   */

  /** Properties **/

  opts = opts || {};

  /* List of attached events */
  this.events = [];

  this.parent    = opts['parent'] || null;   /* Widget's parent */
  this.visible   = true;             /* Is widget visible */
  this.sensitive = true;             /* Is widget sensitive */

  this.dom = null;       /* DOM-tree */
  this.focusDOM = null;  /* DOM element for setting focus */
}

UIWidget.prototype = new UIObject;
UIWidget.prototype.constructor = UIWidget;
