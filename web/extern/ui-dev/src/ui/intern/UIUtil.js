/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIUtil ()
{
  _IObject.call (this);

  /**
   * Get height of an element
   */
  this.getItemHeight = function (item)
    {
      if (!isUnknown (item.height) && typeof item.height != 'function')
        {
          return item.height;
        }
      else if (item.length)
        {
          var height = 0;

          for (var i = 0; i < item.length; ++i)
            {
              // XXX: how could this getter could be optimized?
              var it = item.get ? item.get (i) : iitem[i];
              height += this.getItemHeight (it);
            }

          return height;
        }
      else if (typeof item.height == 'function')
        {
          return item.height ();
        }
      else if (item instanceof Element)
        {
          var dummyDiv = null, tmpNode = null;

          if (!nodeInTree (item, document.body))
            {
              if (item.parentNode)
                {
                  tmpNode = createElement ('DIV');
                  item.parentNode.replaceChild (tmpNode, item);
                }

              dummyDiv = ($('<div style="visibility: hidden; position: absolyte; top: 0; left: 0">')
                           .append ($(item))
                         ) [0];
              document.body.appendChild (dummyDiv);
            }

          var h = $(item).height ();
          var res = 0;

          if (h)
            {
              res = h;
            }
          else
            {
              var h = $(item).css ('height');

              if (h && h.match && h.match (/px$/))
                {
                  res = parseInt (h);
                }
            }

          if (dummyDiv)
            {
              removeNode (item);
              if (tmpNode)
                {
                  tmpNode.parentNode.replaceChild (item, tmpNode);
                }

              removeNode (dummyDiv);
            }

          return res;
        }

      return 0;
    };

  this.getItemDOM = function (item)
    {
      if (typeof item.build == 'function')
        {
          return item.build ();
        }
      else if (item.dom && item.dom instanceof Element)
        {
          return item.dom;
        }
      else if (item.length && typeof item != 'string')
        {
          var res = createElement ('DIV');

          for (var i = 0; i < item.length; ++i)
            {
              // XXX: how could this getter could be optimized?
              var it = item.get ? item.get (i) : iitem[i];
              var dom = this.getItemDOM (it);

              if (dom)
                {
                  res.appendChild (dom);
                }
            }

          return res;
        }
      else if (typeof item == 'object' && item instanceof Element)
        {
          return item;
        }
      else if (item instanceof Object || typeof item == 'string')
        {
          var widget = uiCreator.create (item);
          return widget.build ();
        }

      return null;
    };

  /**
   * Convert user-specified size to style value
   */
  this.sizeToStyle = function (size)
    {
      var size = '' + size;

      if (size.match (/^[0-9]+$/))
        {
          return size + 'px';
        }

      return size;
    };

  this.getContentStyle = function (i, n, firstClass, middleClass, lastClass, lonelyClass)
    {
      if (n == 1)
        {
          return lonelyClass;
        }
      else if (i == 0)
        {
          return firstClass;
        }
      else if (i == n - 1)
        {
          return lastClass;
        }
      else
        {
          return middleClass;
        }
    };
}

function UIUtil ()
{
  IObject.call (this);
}

UIUtil.prototype = new _UIUtil;
UIUtil.prototype.constructor = UIUtil;
