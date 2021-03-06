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

  this.buildItem = function (where, item)
    {
      var holderHeight = uiUtil.getItemHeight (where);
      var dom = uiUtil.getItemDOM (item);
      var height = uiUtil.getItemHeight (dom);

      if (height && height < holderHeight)
        {
          dom.style.marginTop = '';
          var margin = $(dom).css('marginTop');

          if (margin.match (/px$/))
            {
              margin = parseInt (margin);
            }
          else
            {
              margin = 0;
            }

          dom.style.marginTop = (margin + (holderHeight - height) / 2 - 1) + 'px';
        }

      var isBlock = item.block;
      var item = ($('<div class="UIViewportPanelItem">')
                   .append ($(dom))
                 ) [0];

      if (isBlock)
        {
          item.addClass ('UIViewportPanelBlockItem');
        }

      where.appendChild (item);
      return item;
    };

  /**
   * Build items to specified container
   */
  this.buildItems = function (where)
    {
      for (var i = 0; i < this.length (); ++i)
        {
          var item = this.get (i);

          if (item._uivpanel_atEnd)
            {
              continue;
            }

          this.buildItem (where, item);
        }

      for (var i = this.length () - 1; i >= 0; --i)
        {
          var item = this.get (i);

          if (!item._uivpanel_atEnd)
            {
              continue;
            }

          var it = this.buildItem (where, item);
          $(it).addClass ('UIViewportPanelEndItem');
        }
    };

  /**
   * Rebuild all items
   */
  this.rebuildItems = function ()
    {
      this.dom.removeAllNodes ();
      this.buildItems (this.dom);
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
      var viewport = this.getParent ().getViewport ();
      var background = this.getParent ().getBackground ();

      if (this.position % 2)
        {
          var margin = result.getHeight () + 'px';
          viewport.style['margin' + alphaName] = margin
          background.style['margin' + alphaName] = margin;
        }
      else
        {
          var margin = $(result).css('width') || '0px';
          viewport.style['margin' + alphaName] = margin;
          background.style['margin' + alphaName] = margin;
        }

      $(result).disableTextSelect ();

      return result;
    };

  this.add = function (widget, atEnd, rebuild)
    {
      widget._uivpanel_atEnd = defVal (atEnd, false);

      var result = UIContainer.prototype.add.call (this, widget, false);

      if (this.dom || rebuild)
        {
          this.rebuildItems ();
        }

      return result;
    };
}

function UIViewportPanel (opts)
{
  opts = opts || {};

  UIContainer.call (this, opts);

  this.stopEvents = this.stopEvents.concat (['click']);

  this.position = opts['position'];
}

UIViewportPanel.prototype = new _UIViewportPanel;
UIViewportPanel.prototype.constructor = UIViewportPanel;
