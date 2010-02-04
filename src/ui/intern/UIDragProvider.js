/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/**
 * Common mouse click/move action provider
 */
function UIDragProvider ()
{
  IObject.call (this);

  /**
   * Register object for dragging
   */
  this.register = function (object, opts)
    {
      var area;

      if (opts && opts[this.optAreaName])
        {
          area = opts[this.optAreaName];
        }
      else
        {
          area = object[this.areaGetter] ();
        }

      if (isUnknown (area))
        {
          return;
        }

      if (isUnknown (area.length))
        {
          area = [area];
        }

      var handler = function (self, object) { return function (oldHandler) {
              return function (event) {
                var evt = event || window.event;

                /* Call previous handler */
                if (oldHandler)
                  {
                    oldHandler (event);
                  }

                self.onBeginDrag (object, evt);

                stopEvent (event);
                return false;
              }
            };
          } (this, object);

      /* Handler for preveinting raising of `click` event */
      var stubHandler = function (event) {
        stopEvent (event);
        return false;
      }

      for (var i = 0, n = area.length; i < n; ++i)
        {
          area[i].onmousedown = handler (area[i].onmousedown);
          area[i].onclick = stubHandler;
        }
    };

  /**
   * Dragging begin
   */
  this.onBeginDrag = function (object, domEvent)
    {
      this.notifierSent = false;

      this.activeObject = object;
      this.basePoint = {'x': domEvent.clientX, 'y': domEvent.clientY};
    };

  /**
   * Dragging is over
   */
  this.onEndDrag = function ()
    {
      if (this.activeObject)
        {
          this.activeObject[this.endDragMethod] ();
        }

      this.activeObject = null;
      this.basePoint = {'x': 0, 'y': 0};

      this.notifierSent = false;
    };

  /**
   * Handler of mouse moving event
   */
  this.onMouseMove = function (eventData)
    {
      if (!this.activeObject)
        {
          /* Nothing to do */
          return;
        }

      if (!this.notifierSent)
        {
          this.activeObject[this.beginDragMethod] ();
          this.notifierSent = true;
        }

      var domEvent = eventData['domEvent'];
      var newPos = {'x': domEvent.clientX, 'y': domEvent.clientY};

      var delta = {'x': newPos['x'] - this.basePoint['x'],
                   'y': newPos['y'] - this.basePoint['y']};

      this.handleDelta (delta);

      this.basePoint = newPos;
    };

  /**
   * Handler mouse moving delta occurence
   */
  this.handleDelta = function (delta)
    {
    };

  /* Name of key of opts which holds area for begin dragging */
  this.optAreaName = '';

  /* Name of getter for dragging area */
  this.areaGetter = '';

  /* Currently moving object */
  this.activeObject = null;

  /* Base point of object */
  this.basePoint = {'x': 0, 'y': 0};

  /* Had onBeginMove() called for movinf object in? */
  this.notifierSent = false;

  /* Name of method for handling drag beginning */
  this.beginDragMethod = '';

  /* Name of method for handling drag finishing */
  this.endDragMethod = '';

  /* Register common handlers */
  uiManager.addHandler ('mousemove', function (self) {
        return function (eventData) {
          self.onMouseMove (eventData);
        };
      } (this));

  uiManager.addHandler ('mouseup', function (self) {
      return function () {
        self.onEndDrag ();
      };
    } (this));
}

UIDragProvider.prototype = new IObject;
UIDragProvider.prototype.constructor = UIDragProvider;
