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
      cpt.appendChild (document.createTextNode (this.caption));
      this.caption_d = cpt;
      item.appendChild (cpt);

      /* Callbacks */
      result.onclick = function (callback) { return function (event) {
            if (callback)
              {
                window.setTimeout (callback, 10);
              }

            stopEvent (event);
            return false;
          }
        } (this.exec);

      return result;
    }
}

function UIViewportItem (opts)
{
  UIWidget.call (this, opts);

  this.caption = opts['caption'];
  this.image   = opts['image'];
  this.exec    = opts['exec'];

  this.caption_d = null;
  this.image_d = null;
}

UIViewportItem.prototype = new _UIViewportItem;
UIViewportItem.prototype.constructor = UIViewportItem;
