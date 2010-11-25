/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIManager ()
{
  _IEventProxy.call (this);

  /**
   * Get list of handlers, which will be called for handle specified event
   */
  this.getHandlersForEvent = function (event, userData)
    {
      var allHandlers = this.handlers[event];

      if (isUnknown (userData['domEvent']))
        {
          /* Event is not caused by DOM event, so we could get */
          /* small optimization, because there should be no multiply */
          /* calling of the same event */
          return allHandlers;
        }

      var handlers = [];

      if (!allHandlers)
        {
          return null;
        }

      for (var i = 0, n = allHandlers.length; i < n; ++i)
      {
        var handler = allHandlers[i];

        if (handler['regData'] && handler['regData']['affectContext'])
          {
            if (userData['context'] != handler['regData']['affectContext'])
              {
                /* Handler is assigned to another context */
                /* We SHouldn't call it */
                continue;
              }
          }

        /* 'called' is used to prevent multiply calling of the same */
        /* handler, which isn't assigned to any context and event */
        if (!handler['called'])
          {
            handler['called'] = true;
            handlers.push (handler);
          }
      }

      return handlers;
    };

  /**
   * Reset state of handlers
   */
  this.resetHandlersState = function (event)
    {
      var handlers = this.handlers[event];

      if (!handlers)
        {
          return;
        }

      for (var i = 0, n = handlers.length; i < n; ++i)
        {
          handlers[i]['called'] = false;
        }
    };

  /**
   * Register new UI context
   *
   * context is a DOM element
   */
  this.registerContext = function (context, parent)
    {
      context = context || document;
      parent = parent || null;

      if (context.UIContextRegistered)
        {
          /* Context has been already registered */
          return;
        }

      if (context != document && parent == null)
        {
          parent = document;
        }

      context.parentContext = parent;
      this.setContextHandlers (context);

      context.UIContextRegistered = true;
      context.isUIContext = true;
    };

  /**
   * Set default event handlers to the context
   */
  this.setContextHandlers = function (context)
    {
      for (var i = 0, n = this.defaultEvents.length; i < n; ++i)
        {
          var evt = this.defaultEvents[i];
          var handler = function (self, context) {
            return function (event) {
              return function (domEvent) {
                var evt = domEvent || window.event;

                self.onContextEvent (context, event, {'domEvent': evt});

                if (event.match(/Cancel$/))
                  {
                    self.resetHandlersState (event);
                  }

                if (evt.cancelBubble)
                  {
                    return false;
                  }
              }
            }
          } (this, context);

          $(context) [evt] (handler (evt));
          context[evt + 'Cancel'] = handler (evt + 'Cancel');
        }
    };

  /**
   * Handler of event occurrence in specified UI context
   */
  this.onContextEvent = function (context, event, userData)
    {
      userData = userData || {};
      userData['context'] = context;

      this.event (event, userData);

      if (context == document || this.cancelFlag)
        {
          /* Reset handlers' state, so they all will try */
          /* to call next time when event occurs */
          this.resetHandlersState(event);
        }
    };

  /**
   * Break executing of event handlers
   */
  this.onCancel = function (userData) {
    if (userData['domEvent'])
      {
        stopEvent (userData['domEvent']);
      }
  };
}

function UIManager ()
{
  IEventProxy.call (this);

  this.defaultEvents = ['click', 'mousedown', 'mouseup', 'mouseover',
                        'mouseout', 'mousemove', 'keypress', 'keydown', 'keyup'];

  /* Register root context */
  this.registerContext();
}

UIManager.prototype = new _UIManager;
UIManager.prototype.constructor = UIManager;

var uiManager = new UIManager ();
