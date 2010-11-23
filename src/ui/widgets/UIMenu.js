/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIMenu ()
{
  _UIContainer.call (this);

  /**
   * Get all holders
   */
  this.getHolders = function ()
    {
      var holders = null;
      var dom = ($('<div></div>')
                   .addClass ('UIMenu')
                   .append ((holders = $('<div></divv>'))
                                .addClass ('UIMenuItemsHolder')
                          )
                ) [0];

      holders = holders[0];
      holders.widgetsCount = this.length ();

      for (var i = 0, n = this.length (); i < n; ++i)
        {
          var it = this.get (i);
          if (it.image)
            {
              $(holders).addClass ('UIMenuImagedItems');
              break;
            }
        }

      return {'dom': dom, 'holders': [holders]};
    };

  /**
   * Add menu item
   */
  this.add = function (item)
    {
      item.build = this.buildMenuItem;
      return UIContainer.prototype.add.call (this, item);
    };


  /**
   * Builder of menu item
   *
   * Note: context is item in this function, not UIMenu
   */
  this.buildMenuItem = function ()
    {
      var cb = function (onClick) {return function () {
            if (onClick)
              {
                window.setTimeout (onClick, 10);
              }
          }
        } (this.onClick);

      var item = ($('<div></div>')
                     .addClass ('UIMenuItem')
                     .addClass  (this.image ? 'UIMenuItemImage' : '')
                     .addClass  (this.default ? 'UIMenuItemDefault' : '')
                     .append (this.image ? ($('<img></img>')
                                               .attr ('src', this.image)) : null)
                     .append ($('<span></span>').append (createTextNode (this.title)))
                     .click (cb)
                 );

      return item[0];
    };
}

function UIMenu (opts)
{
  opts = opts || {};

  UIContainer.call (this, opts);
}

UIMenu.prototype = new _UIMenu;
UIMenu.prototype.constructor = UIMenu;
