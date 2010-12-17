/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIImage (opts)
{
  _UIWidget.call (this);

  /**
   * Build DOM tree for image
   */
  this.doBuild = function ()
    {
      var div = createElement ('DIV');
      div.className = 'UIImage';

      var img = createElement ('IMG');
      img.src = this.image;

      div.appendChild (img);

      this.imageDOM = img;

      return div;
    };

  this.getImage = function ()
    {
      return this.image;
    };

  this.setImage = function (image)
    {
      this.image = image;
      this.imageDOM.src = image;
    };
}

/***
 * Constructor
 */
function UIImage (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  /* image source */
  this.image = defVal (opts['image'], '');

  this.imageDOM = null;
}

UIImage.prototype = new _UIImage;
UIImage.prototype.constructor = UIImage;
