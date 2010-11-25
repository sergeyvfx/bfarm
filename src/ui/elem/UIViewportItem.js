/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIViewportItem ()
{
  _UIWidget.call (this);

  /**
   * Build DOM tree
   */
  this.doBuild = function ()
    {
      var result = createElement ('LI');
      var item = createElement ('DIV');

      result.className = 'UIViewportItemHolder';
      item.className = 'UIViewportItem';

      result.appendChild (item);

      /* Image */
      var img = createElement ('IMG');
      img.className = 'UIViewportItemIcon';
      img.src = this.image;
      this.img_d = img;
      item.appendChild (img);

      /* Caption */
      var cpt = createElement ('DIV');
      cpt.className = 'UIViewportItemCaption';
      cpt.appendChild (createTextNode (this.caption));
      this.caption_d = cpt;
      item.appendChild (cpt);

      /* Callbacks */
      item.onclick = function (callback) { return function (event) {
            if (callback)
              {
                window.setTimeout (callback, 10);
              }

            stopEvent (event);
            return false;
          }
        } (this.exec);

      $(item).rightMouseDown (function (self) { return function (event) {
               self.onContextMenu ({'x': event.clientX, 'y': event.clientY});
            };
          } (this))

      if (this.movable)
        {
          UI_MakeMovable (item);
          item.onEndMove = wrapMeth (this, 'onEndMove');
        }

      $(result).disableTextSelect ();

      return result;
    };

  this.onContextMenu = function (point)
    {
      this.parent.showItemContextMenu (this, point);
    };

  this.onEndMove = function ()
    {
      var item = this.dom.childNodes[0];
      var left = parseInt (item.style.left);
      var top = parseInt (item.style.top);

      this.parent.onItemEndMove (this, {'x': left, 'y': top});
    };
}

function UIViewportItem (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  this.caption = opts['caption'];
  this.image   = opts['image'];
  this.exec    = opts['exec'];
  this.movable = defVal (opts['movable'], false);

  this.caption_d = null;
  this.image_d = null;
}

UIViewportItem.prototype = new _UIViewportItem;
UIViewportItem.prototype.constructor = UIViewportItem;
