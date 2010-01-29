/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIManager ()
{
  /* Implement event proxy methods */
  IEventProxy.call (this);

  /**
   * Register new UI context
   *
   * context is a DOM element
   */
  this.registerContext = function (context, parent)
    {
      context = context || document;
      parent = parent || null;

      context.parentContext = parent;
      this.setContextHandlers (context);
    };

  /**
   * Set default event handlers to the context
   */
  this.setContextHandlers = function (context)
    {
      for (var i = 0, n = this.defaultEvents.length; i < n; ++i)
        {
          var evt = this.defaultEvents[i];
          var handler = function (self, context, event) {
            return function (domEvent) {
              var evt = domEvent || window.event;
              self.onContextEvent (context, event, {'domEvent': evt});

              if (evt.cancelBubble)
                {
                  return false;
                }
            }
          } (this, context, evt);
          attachEvent (context, evt, handler);
        }
    };

  /**
   * Handler of event occurance in specified UI context
   */
  this.onContextEvent = function (context, event, userData)
    {
      userData = userData || {};
      userData['context'] = context;

      this.event(event, userData);
    };

  this.addHandlerAtContext = function (context, event, handler, regData)
    {
      /**
       * FIXME: Not actually implemented
       */

      var handlerData = this.addHandler (event, handler, regData);

      return handlerData;
    };

  this.defaultEvents = ['click', 'mousedown', 'mouseup', 'mouseover',
                        'mouseout', 'mousemove'];

  /* Register root context */
  this.registerContext();
}

UIManager.prototype = new IEventProxy;
UIManager.prototype.constructor = UIManager;

var uiManager = new UIManager ();
