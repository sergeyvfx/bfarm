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

      for (var i = 0, n = handlers.length; i < n; ++i)
        {
          //try
            {
              handlers[i]['handler'] (userData, handlers[i]['regData']);
            }
          //catch (e)
            {
              //alert (e);
            }
        }
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

  this.handlers = {};
}

IEventProxy.prototype = new IObject;
IEventProxy.prototype.constructor = IEventProxy;
