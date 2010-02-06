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
   * Add new event handler (event is string only)
   */
  this.doAddHandler = function (event, handler, regData)
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
   * Add new event handler (event is string or iist)
   */
  this.addHandler = function (event, handler, regData) {
    if (typeof event == 'string')
      {
        this.doAddHandler (event, handler, regData);
      }
    else
      {
        for (var i = 0, n = event.length; i < n; ++i)
          {
            this.doAddHandler (event[i], handler, regData);
          }
      }
  }

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
      var field = '__IEventProxy_stop'

      if (!handlers)
        {
          /* No handlers to call */
          return;
        }

      userData.cancel = function (self, userData, field) {return function () {
            userData[field] = true;
          }
        } (this, userData, field);

      for (var i = 0, n = handlers.length; i < n; ++i)
        {
          var handler = handlers[i]['handler'];
          var regData = handlers[i]['regData'];

          userData['global'] = regData;

          //try
            {
              var ret = handler (userData, regData);

              if (userData[field])
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
   * Handler of breaking handlers executing
   */
  this.onCancel = function (userData) {};

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
}

IEventProxy.prototype = new IObject;
IEventProxy.prototype.constructor = IEventProxy;
