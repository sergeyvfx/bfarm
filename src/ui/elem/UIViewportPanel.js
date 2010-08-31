/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

var
  VP_PANEL_TOP    = 0x01,
  VP_PANEL_LEFT   = 0x02,
  VP_PANEL_BOTTOM = 0x03,
  VP_PANEL_RIGHT  = 0x04;

var
  VP_PANEL_ALPHAS = ['Top', 'Left', 'Bottom', 'Right'];

function _UIViewportPanel ()
{
  _UIContainer.call (this);

  /**
   * Build items to specified container
   */
  this.buildItems = function (where)
    {
      var holderHeight = uiUtil.getItemHeight (where);

      for (var i = 0; i < this.length (); ++i)
        {
          var item = this.get (i);
          var dom = uiUtil.getItemDOM (item);
          var height = uiUtil.getItemHeight (dom);

          if (height && height < holderHeight)
            {
              dom.style.marginTop = ((holderHeight - height) / 2 - 1) + 'px';
            }

          var item = ($('<div class="UIViewportPanelItem">')
                       .append ($(dom))
                     ) [0];

          where.appendChild (item);
        }
    };

  /**
   * Build DOM tree
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');
      var alphaName = VP_PANEL_ALPHAS[this.position - 1];

      result.className = 'UIViewportPanel';
      result.addClass ('UIViewport' + alphaName + 'Panel');

      this.buildItems (result);

      /* Hack viewport margins */
      var viewport = this.getParent().getViewport();

      if (this.position % 2)
        {
          viewport.style['margin' + alphaName] = $(result).css('height') || '0px';
        }
      else
        {
          viewport.style['margin' + alphaName] = $(result).css('width') || '0px';
        }

      return result;
    }
}

function UIViewportPanel (opts)
{
  opts = opts || {};

  UIContainer.call (this, opts);

  this.position = opts['position'];
}

UIViewportPanel.prototype = new _UIViewportPanel;
UIViewportPanel.prototype.constructor = UIViewportPanel;
