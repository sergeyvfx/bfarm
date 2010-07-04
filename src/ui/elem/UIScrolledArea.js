/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIScrolledArea ()
{
  _UIContainer.call (this);

  /**
   * Get paddings for scroll holder
   */
  this.getScrollHolderPaddings = function ()
    {
      var padding = this.withBorder ? 4 : 0;
      return {'top':    padding,
              'right':  padding,
              'bottom': padding,
              'left':   padding}
    };

  /**
   * BUild dom structure for nice scroll
   */
  this.buildScroller = function ()
    {
      var jqHolder;
      var paddings = this.getScrollHolderPaddings ();

      var dom = ($('<div></div>')
          .css ('display', 'table')
          .append($('<div></div>')
                    .css ('display', 'table-cell')
                    .css ('height', '100%')
                    .append ((jqHolder = $('<div></div>'))
                             .css ('overflow', 'auto')
                             .css ('position', 'absolute')
                             .css ('top', paddings.top + 'px')
                             .css ('bottom', paddings.bottom + 'px')
                             .css ('left', paddings.left + 'px')
                             .css ('right', paddings.right + 'px')
                            )
                 )) [0];

      dom['holder'] = jqHolder[0];

      return dom;
    };

  /**
   * Build main DOM tree and return holders for widgets
   */
  this.getHolders = function ()
    {
      var dom, holders;

      dom = createElement ('DIV');
      dom.className = this.outerClassName;
      dom.style.height = '150px';

      scroller = this.buildScroller ();
      scroller.holder.widgetsCount = this.length ();

      dom.appendChild (scroller);

      if (this.withBorder)
        {
          $(dom).addClass ('UIScrolledAreaBordered');
        }

      return {'dom': dom, 'holders': [scroller.holder]};
    };

  /**
   * Is border displayed?
   */
  this.getBorder = function ()
    {
      return this.withBorder;
    };

  /**
   * Set show border flag
   */
  this.setBorder = function (withBorder)
    {
      this.withBorder = isTruth (withBorder);

      this.rebuild ();
    };
}

function UIScrolledArea (opts)
{
  opts = opts || {};

  UIContainer.call (this, opts);

  /* should border be shown? */
  this.withBorder = isUnknown (opts['withBorder']) ?
          false :
          isTruth (opts['withBorder']);

  /* class name for the most outer dom holder */
  this.outerClassName = 'UIScrolledArea';
}

UIScrolledArea.prototype = new _UIScrolledArea;
UIScrolledArea.prototype.constructor = UIScrolledArea;
