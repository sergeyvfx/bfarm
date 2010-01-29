/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function IUIMovable ()
{
  /**
   * Move object by given coordinats deltas
   *
   * @param delta = object with fields x and y
   */
  this.moveBy = function (delta)
    {
    };

  /**
   * Object started moving event handler
   */
  this.onBeginMove = function ()
    {
    };

  /**
   * Object finished moving event handler
   */
  this.onEndMove = function ()
    {
    };

  /**
   * Get area, by which object could be moved
   *
   * Area should be a DOM element or list of DOM elements
   */
  this.getMoveArea = function ()
    {
    };

  /**
   * Validate moving delta
   *
   * Could be null or function, which receives validated delta
   */
  this.validateMoveDelta = null;
}

IUIMovable.prototype = new IUIMovable;
IUIMovable.prototype.constructor = IUIMovable;

function UIMoveManager ()
{
  /**
   * Register new movable object
   */
  this.register = function (object, opts)
    {
      var area;

      if (opts && opts['moveArea'])
        {
          area = opts['moveArea'];
        }
      else
        {
          area = object.getMoveArea ();
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

                self.onBeginMove (object, evt);
                return false;
              }
            };
          } (this, object);

      for (var i = 0, n = area.length; i < n; ++i)
        {
          area[i].onmousedown = handler (area[i].onmousedown);
        }
    };

  /**
   * Handler of event, when object begins moving
   */
  this.onBeginMove = function (object, domEvent)
    {
      this.beginMoveSend = false;

      this.movingObject = object;
      this.basePoint = {'x': domEvent.clientX, 'y': domEvent.clientY};

    };

  /**
   * Handler of event, when object ends moving
   */
  this.onEndMove = function ()
    {
      if (this.movingObject)
        {
          this.movingObject.onEndMove ();
        }

      this.movingObject = null;
      this.basePoint = {'x': 0, 'y': 0};

      this.beginMoveSend = false;
    };

  /**
   * Handler of mouse moving event
   */
  this.onMouseMove = function (eventData)
    {
      if (!this.movingObject)
        {
          /* Nothing to move */
          return;
        }

      if (!this.beginMoveSend)
        {
          this.movingObject.onBeginMove ();
          this.beginMoveSend = true;
        }

      var domEvent = eventData['domEvent'];
      var newPos = {'x': domEvent.clientX, 'y': domEvent.clientY};

      var delta = {'x': newPos['x'] - this.basePoint['x'],
                   'y': newPos['y'] - this.basePoint['y']};

      /* Validate delta, by which user tries to move object */
      if (this.movingObject.validateMoveDelta)
        {
          delta = this.movingObject.validateMoveDelta (delta);
        }

      this.movingObject.moveBy (delta);

      this.basePoint = newPos;
    };

  /* Currently moving object */
  this.movingObject = null;

  /* Base point of moving object */
  this.basePoint = {'x': 0, 'y': 0};

  /* Had onBeginMove() called for movinf object in? */
  this.beginMoveSend = false;

  /* All movable object */
  this.objects = [];

  /* Register common handlers */
  uiManager.addHandler ('mousemove', function (self) {
        return function (eventData) {
          self.onMouseMove (eventData);
        };
      } (this));

  uiManager.addHandler ('mouseup', function (self) {
      return function () {
        self.onEndMove ();
      };
    } (this));
}

/**
 * Register new moveble object
 *
 * Object should implement IUIMovable methods
 */
function UI_MakeMovable(object, opts)
{
  uiMoveManager.register (object, opts);
}

UIMoveManager.prototype = new IObject;
UIMoveManager.prototype.constructor = UIMoveManager;

var uiMoveManager = new UIMoveManager;
