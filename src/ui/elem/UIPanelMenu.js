/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIPanelMenu ()
{
  _UIContainer.call (this);

  /**
   * Build DOM tree
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');

      result.className = 'UIPanelMenuButton';

      result.appendChild (createTextNode (this.caption));

      $(result).click (wrapMeth (this, 'activate'));

      this.menuButton = result;

      return result;
    };

  /**
   * Get point for menu popup
   */
  this.getPopupPoint = function ()
    {
      var point = {'x': 0, 'y': 0};

      var p = this.parent;
      if (p)
        {
          var offset = p.dom.offset ();

          // XXX:
          if (p.position == VP_PANEL_TOP)
            {
              point['x'] = offset.left;
              point['y'] = offset.top + p.dom.getHeight ();
            }
        }

      return point;
    };

  /**
   * Get menu dimensions
   */
  this.getMenuDimensions = function ()
    {
      var dim = {'x': 'auto', 'y': 'auto'};

      var p = this.parent;
      if (p)
        {
          if (p.position == VP_PANEL_TOP || p.position == VP_PANEL_BOTTOM)
            {
              dim['x'] = p.dom.outerWidth () - 2 + 'px';
            }
        }

      return dim;
    };

  /**
   * Create holder for menu content
   */
  this.createMenuHolder = function ()
    {
      var holder = createElement ('DIV');
      holder.className = 'UIPanelMenuHolder';

      holder.hidePopup = function (self) { return function () {
            Element.prototype.hidePopup.call (this);
            self.deactivate ();
          }
        } (this);

      var dim = this.getMenuDimensions ();
      holder.style.width = dim.x;

      return holder;
    };

  /**
   * Create menu with all content
   */
  this.createMenu = function ()
    {
      var holder = this.createMenuHolder ();

      var menu = createElement ('DIV');
      menu.className = 'UIPanelMenu';

      for (var i = 0, n = this.length (); i < n; ++i)
        {
          var dom = uiUtil.getItemDOM (this.get (i));
          menu.appendChild (dom);
        }

      holder.appendChild (menu);

      return holder;
    };

  /**
   * Activate menu
   */
  this.activate = function ()
    {
      if (this.activated)
        {
          return;
        }

      $(this.menuButton).addClass ('UIPanelMenuButtonActive');

      var menu = this.createMenu ();
      var point = this.getPopupPoint ();

      uiPopupManager.popup (menu, point);

      this.activated = true;
    };

  /**
   * Deactivate menu
   */
  this.deactivate = function ()
    {
      $(this.menuButton).removeClass ('UIPanelMenuButtonActive');

      this.activated = false;
    };
}

function UIPanelMenu (opts)
{
  opts = opts || {};

  UIContainer.call (this, opts);

  this.caption = opts['caption'];
  this.image   = opts['image'];

  this.menuButton = null;
  this.activated = false;
}

UIPanelMenu.prototype = new _UIPanelMenu;
UIPanelMenu.prototype.constructor = UIPanelMenu;
