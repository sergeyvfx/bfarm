/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIList ()
{
  _UIAbstractList.call (this);

  /**
   * Build DOM for specified child
   */
  this.buildChild = function (itemIndex)
    {
      var child = this.container[itemIndex];
      var result = createElement ('DIV');

      if (child.build)
        {
          result.appendChild (child.build ());
        }
      else
        {
          result.innerHTML = '' + child;
        }

      this.processItemDOM (itemIndex, result);

      return result;
    };

  this.getHolders = function ()
    {
      var result = createElement ('DIV');
      var scroller = createElement ('DIV');
      var holder = createElement ('DIV');

      result.className = 'UIList';
      scroller.className = 'UIListScroller';
      holder.className = 'UIListItemHolder';

      scroller.appendChild (holder);
      result.appendChild (scroller);

      /* Holder for unlimited count of widgets */
      holder.widgetsCount = -1;

      $(result).disableTextSelect ();

      return {'dom': result, 'holders': [holder]}
    };

  this.doBuild = function ()
    {
      var result = UIAbstractList.prototype.doBuild.call (this);

      if (this.transparent)
        {
          result.addClass ('UIListTransparent');
        }

      if (this.height != null || this.width != null)
        {
          result.addClass ('UIListFixedSize');
        }

      return result;
    };

  /**
   * Do all what needed after active element changed
   */
  this.doItemSelect = function (itemIndex)
    {
      var result = UIAbstractList.prototype.doItemSelect.call (this, itemIndex);
      this.updateBinding (this.getBindingValue ());
      return result;
    };

  this.add = function (item)
    {
      if (typeof item.toString == 'string')
        {
          if (item.toString.match (/^field:/))
            {
              var field = item.toString.replace (/^field:/, '');
              item.toString = function (field) { return function () { return this[field]; } } (field);
            }
          else
            {
              item.toString = uiUtil.findHandler (item.toString);
            }
        }

      var result = UIAbstractList.prototype.add.call (this, item);

      /* binding value could be changed after adding new item */
      this.updateBinding (this.getBindingValue ());

      return result;
    };
}

/****
 * Constructor
 */
function UIList (opts)
{
  opts = opts || {};
  UIAbstractList.call (this, opts);

  /* Class name for list item DOM element */
  this.itemClassName = 'UIListListItem';

  /* Class name for active list item DOM element */
  this.itemActClassName = 'UIListActiveListItem';

  this.stopEvents = this.stopEvents.concat (['click']);

  this.transparent = opts['transparent'];

  this.updateBinding (this.getBindingValue ());
}

UIList.prototype = new _UIList;
UIList.prototype.constructor = UIList;
