/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIPanel ()
{
  _UIScrolledArea.call (this);

  /**
   * Get paddings for scroll holder
   */
  this.getScrollHolderPaddings = function ()
    {
      var res = UIScrolledArea.prototype.getScrollHolderPaddings.call (this);

      if (this.hasHeader ())
        {
          var tmpHeader = $('<div></div>') . addClass ('UIPanelHeader');
          var margin = parseInt ($(tmpHeader).css ('marginTop')) +
                       parseInt ($(tmpHeader).css ('marginBottom')) + 2;

          res.top += uiUtil.getItemHeight (this.header) + margin;
        }

      return res;
    };

  /**
   * Create DOM with header elements
   */
  this.buildHeader = function ()
    {
      var header = null;

      if (this.header)
        {
          header = uiUtil.getItemDOM (this.header);

          if (isUnknown (header.tagName) || header.tagName.toLowerCase () != 'div')
            {
              header = $('<div></div>').append (header);
            }

          $(header).addClass (this.headerClassName);
        }

      return header;
    };

  /**
   * Build main DOM tree and return holders for widgets
   */
  this.getHolders = function ()
    {
      var res = UIScrolledArea.prototype.getHolders.call (this);

      var header = this.buildHeader ();
      if (header)
        {
          res.dom.pushFront (header);
        }

      return res;
    };

  /**
   * Check if widget has got a header
   */
  this.hasHeader = function ()
    {
      return !isUnknown (this.header);
    };
}

function UIPanel (opts)
{
  opts = opts || {};

  if (isUnknown (opts['withBorder']))
    {
      opts['withBorder'] = true;
    }

  UIScrolledArea.call (this, opts);

  /* Header content */
  this.header = defVal (opts['header'], null);

  /* class name for the most outer dom holder */
  this.outerClassName = 'UIPanel';

  /* class name for the most outer dom holder */
  this.headerClassName = 'UIPanelHeader';

  /* system fields */
  this.scroller = null;
}

UIPanel.prototype = new _UIPanel;
UIPanel.prototype.constructor = UIPanel;
