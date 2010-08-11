/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIContainer ()
{
  _IContainer.call (this);
  _UIWidget.call (this);

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
      return null;
    };

  /**
   * Build DOM for specified child
   */
  this.buildChild = function (widgetIndex)
    {
      return this.container[widgetIndex].build ();
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

          if (m == -1)
            {
              m = widgetCount;
            }

          for (var j = 0; j < m && widgetIndex < widgetCount; ++j)
            {
              var dom = this.buildChild (widgetIndex);
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
   * Add child widget
   */
  this.add = function (widget, rebuild)
    {
      rebuild = defVal (rebuild, this.dom != null);

      IContainer.prototype.add.call (this, widget);
      widget.parent = this;

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
      IContainer.prototype.remove.call(this, widget);

      if (rebuild)
        {
          this.rebuild ();
        }
    };

  /**
   * Make some tweaks after embedding widget to container
   */
  this.postEmbedTweaks = function ()
    {
      this.isEmbedded ()
      if (!this.isEmbedded ())
        {
          return;
        }

      UIWidget.prototype.postEmbedTweaks.call (this);

      for (var i = 0, n = this.length (); i < n; ++i)
       {
         var c = this.get (i);

         if (this.widgetField)
           {
             c = c[this.widgetField];

             if (!c)
               {
                 continue;
               }
           }

         if (typeof c.postEmbedTweaks == 'function')
           {
             c.postEmbedTweaks ();
           }
       }
    };
}

/***
 * Constructor
 */
function UIContainer (opts)
{
  opts = opts || {};

  IContainer.call (this);
  UIWidget.call (this, opts);

  this.widgetField = null;
}

UIContainer.prototype = new _UIContainer;
UIContainer.prototype.constructor = UIContainer;
