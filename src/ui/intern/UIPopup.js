/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function IUIPopup ()
{
  /**
   * Show popup object at specified point
   *
   * Point is an object with structure {x, y}
   */
  this.popupAt = function (point)
    {
    };

  /**
   * Hide popup
   */
  this.hidePopup = function ()
    {
    };
}

IUIPopup.prototype = new IUIPopup;
IUIPopup.prototype.constructor = IUIPopup;

function UIPopupManager ()
{
  IObject.call (this);

  /**
   * Show new popup object
   */
  this.popup = function (object, point, opts)
    {
      var context = object.getUIContext ();
      object.popupAt (point);

      this.stack.push ({'object': object,
                        'opts': opts,
                        'context': context});

      uiManager.registerContext (context);
    }

  /**
   * Handler of click event
   */
  this.clickHandler = function (userData)
    {
      var context = userData['context'];
      var top = this.topItem ();

      if (!top || top['context'] == context)
      {
        return;
      }

      this.hideFromContext (context);

      userData.cancel (true);
    };

  /**
   * Handler of keypress event
   */
  this.keypressHandler = function (userData)
    {
      var event = userData['domEvent'];

      if (event.keyCode == 27 && this.stack.length)
        {
          this.hideTopLevel ();
          userData.cancel (true);
        }
    };

  /**
   * Hide item from stack
   */
  this.hideStackItem = function (item)
    {
      var obj = item['object'];

      obj.hidePopup ();

      var index = this.stack.indexOf (item);
      this.stack.splice (index, 1);
    };

  /**
   * Hide top-level popup object
   */
  this.hideTopLevel = function ()
    {
      if (this.stack.length)
        {
          var item = this.stack[this.stack.length - 1];
          this.hideStackItem (item);
        }
    };

  /**
   * Hide all popups from specified stack item
   */
  this.hideFromStackItem = function (item)
    {
      var index = item ? this.stack.indexOf (item) + 1 : 0;

      for (var i = this.stack.length - 1; i >= index; --i)
        {
          this.hideStackItem (this.stack[i]);
        }
    };

  /**
   * Hide all popups
   */
  this.hideAll = function ()
    {
      this.hideFromStackItem (null);
    };

  /**
   * Hide all popups from specified context
   */
  this.hideFromContext = function (context)
    {
      var item = this.getPopupByContext (context);
      this.hideFromStackItem (item);
    };

  /**
   * Get popup object descriptor by it's context
   */
  this.getPopupByContext = function (context)
    {
      for (var i = 0, n = this.stack.length; i < n; ++i)
        {
          var item = this.stack[i];

          if (item['context'] == context)
            {
              return item;
            }
        }

      return null;
    };

  /**
   * Get stack's top item
   */
  this.topItem = function ()
    {
      return this.stack.length ? this.stack[this.stack.length - 1] : null;
    };

  /* Stack of popupped objects */
  this.stack = [];

  /* Handle click callback for hiding popup objects which are */
  /* "outside" of clicked place */
  uiManager.addHandler ('click', function (self) {
      return function (userData) {
        self.clickHandler (userData);
      };
    } (this));

  /* Use keyup instead of keypress to get ompatibility with more browsers */
  uiManager.addHandler ('keyup', function (self) {
      return function (userData) {
        self.keypressHandler (userData);
      };
    } (this));
}

UIPopupManager.prototype = new IObject;
UIPopupManager.prototype.constructor = UIPopupManager;

var uiPopupManager = new UIPopupManager;
