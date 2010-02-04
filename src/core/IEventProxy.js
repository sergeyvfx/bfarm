/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/**
 * Proxy for events
 *
 * Makes registering/fiering/etc events e2u
 */
function IEventProxy ()
{
  IObject.call (this);

  /**
   * Add new event handler
   */
  this.addHandler = function (event, handler, regData)
    {
      if (typeof this.handlers[event] == 'undefined')
        {
          this.handlers[event] = [];
        }

      var handlerData = {'handler': handler, 'regData': regData}
      this.handlers[event].push (handlerData);

      return handlerData;
   	};

  /**
   * Get list of handlers, which will be called for handle specified event
   */
  this.getHandlersForEvent = function (event, userData)
    {
      return this.handlers[event];
    };

  /**
   * Call event handlers
   */
  this.event = function (event, userData)
    {
      var handlers = this.getHandlersForEvent (event, userData);

      if (!handlers)
        {
          /* No handlers to call */
          return;
        }

      /* Reset breaking execution flag */
      this.cont ();

      userData.cancel = function (self, userData) {return function () {
            self.cancel (userData);
          }
        } (this, userData);

      for (var i = 0, n = handlers.length; i < n; ++i)
        {
          var handler = handlers[i]['handler'];
          var regData = handlers[i]['regData'];

          userData['global'] = regData;

          //try
            {
              var ret = handler (userData, regData);

              if (this.cancelFlag)
                {
                  break;
                }
            }
          //catch (e)
            {
              //alert (e);
            }
        }
    };

  /**
   * Break executing of event handlers
   */
  this.cancel = function (userData) {
    this.cancelFlag = true;
  };

  /**
   * Continue executing of event handlers
   */
  this.cont = function () {
    this.cancelFlag = false;
  };

  /**
   * Destructor
   */
  this.destroy = function ()
    {
      delete this.handlers;
      this.handlers = null;

      IObject.prototype.destroy.call (this);
    };

  /* Hasn of {event}=>{list of handlers} */
  this.handlers = {};

  /* Flag of breaking executing of event handlers */
  this.cancelFlag = false;
}

IEventProxy.prototype = new IObject;
IEventProxy.prototype.constructor = IEventProxy;
