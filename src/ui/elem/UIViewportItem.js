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

      if ($.browser.msie)
        {
          img.ondragstart = function () { return false; };
        }

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

      if (this.point)
        {
          item.style.position = 'absolute';
          item.style.left = this.point['x'] + 'px';
          item.style.top  = this.point['y'] + 'px';
        }

      if (this.movable)
        {
          UI_MakeMovable (item);
          item._moved = false;
          item.onEndMove = wrapMeth (this, 'onEndMove');

          item.validateMoveDelta = function (self) { return function (delta) {
                return self.validateItemMoveDelta (this, delta);
              }
            } (this);
        }

      $(item).rightMouseDown (function (self) { return function (event) {
               self.onContextMenu ({'x': event.clientX, 'y': event.clientY});
            };
          } (this))

      $(result).disableTextSelect ();

      return result;
    };

  this.validateItemMoveDelta = function (item, delta)
    {
      var x = item.offsetLeft;
      var y = item.offsetTop;
      var w = item.offsetWidth;
      var h = item.offsetHeight;
      var vp = this.parent.getViewport ();

      if (!item._moved)
        {
          if (delta['x'] < this.moveThreshold)
            {
              delta['x'] = 0;
            }

          if (delta['y'] < this.moveThreshold)
            {
              delta['y'] = 0;
            }

          if (delta['x'] || delta['y'])
            {
              item._moved = true;
            }
        }

      /* Horisontal limits */
      if (x + delta['x'] < 0)
        {
          delta['x'] = -x;
        }

      if (x + delta['x'] + w > vp.clientWidth)
        {
          delta['x'] = vp.clientWidth - x - w;
        }

      /* Horisontal limits */
      if (y + delta['y'] < 0)
        {
          delta['y'] = -y;
        }

      if (y + delta['y'] + h > vp.clientHeight)
        {
          delta['y'] = vp.clientHeight - y - h;
        }

      return delta;
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

      item._moved = false;

      item._uiSavedPos = null;

      this.parent.onItemEndMove (this, {'x': left, 'y': top});
    };

  this.validatePosition = function ()
    {
      var item = this.dom.childNodes[0];

      if (item.style.position != 'absolute')
        {
          return;
        }

      var left = parseInt (item.style.left);
      var top = parseInt (item.style.top);

      if (item._uiSavedPos)
        {
          left = item._uiSavedPos['x'];
          top = item._uiSavedPos['y'];
        }

      var width = item.offsetWidth;
      var height = item.offsetHeight;
      var vp = this.parent.getViewport ();

      item._uiSavedPos = {'x': left, 'y': top}

      left = Math.min(left, vp.clientWidth - width);
      top  = Math.min(top, vp.clientHeight - height);

      item.style.left = left + 'px';
      item.style.top = top + 'px';
    };

  this.getMoveThreshold = function ()
    {
      return this.moveThreshold;
    };

  this.setMoveThreshold = function (threshold)
    {
      this.moveThreshold = threshold;
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
  this.point   = defVal (opts['point'], null);

  this.moveThreshold = defVal (opts['moveThreshold'], 20);

  this.caption_d = null;
  this.image_d = null;
}

UIViewportItem.prototype = new _UIViewportItem;
UIViewportItem.prototype.constructor = UIViewportItem;
