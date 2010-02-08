/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIContainer (opts)
{
  opts = opts || {};

  /**
   * Build main DOM tree and return holders for widgets
   *
   * Return value should have structure {'dom', 'holders'}
   *
   * Holder is a DOM element, to which widgets will be appended
   * This DOM element could contain a widgetsCount property if it wants
   * to hold more than one widget 
   */
  this.getHolders = function ()
    {
    
    };

  /**
   * Build DOM tree for container
   */
  this.doBuild = function ()
    {
      var build = this.getHolders ();
      var widgetCount = this.container.length;

      if (!build)
        {
          return null;
        }

      var holders = build['holders'];
      var widgetIndex = 0;

      if (!holders)
        {
          return build['dom'];
        }

      for (var i = 0; i < holders.length; ++i)
        {
          var m = defVal (holders[i].widgetsCount, 1);

          for (var j = 0; j < m && widgetIndex < widgetCount; ++j)
            {
              var dom = this.container[widgetIndex].build ();
              ++widgetIndex;

              if (!dom)
                {
                  continue;
                }

              holders[i].appendChild (dom);
            }
        }

      return build['dom'];
    };

  /**
   * Get list of all widgets
   */
  this.getContainer = function ()
    {
      return this.container;
    }

  /**
   * Add child widget
   */
  this.add = function (widget, rebuild)
    {
      rebuild = defVal (rebuild, true);

      this.container.push (widget);

      if (rebuild)
        {
          this.rebuild ();
        }
    };

  /**
   * Remove widget from container
   */
  this.remove = function (widget, rebuild)
    {
      rebuild = defVal (rebuild, true);

      var index = this.container.indexOf (wodget);
      if (index >= 0)
        {
          this.container.splice (index, 1)

          if (rebuild)
            {
              this.rebuild ();
            }

        }
    };

  /***
   * Constructor
   */

  this.container = [];
}

UIContainer.prototype = new UIWidget;
UIContainer.prototype.constructor = UIContainer;
