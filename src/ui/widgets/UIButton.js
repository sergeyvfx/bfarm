/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIButton ()
{
  _UIWidget.call (this);


  /**
   * Build DOM tree for button
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIButton';
      this.imageElement = null;

      var innerHTML = '';
      if (this.image)
        {
          innerHTML += '<img src="' + this.image + '">';
        }
      innerHTML += '<span>' + this.title + '</span>';

      var text;
      text = createElement ('SPAN');
      text.innerHTML = innerHTML;

      if (this.image)
        {
          this.imageElement = text.childNodes[0];
          this.titleElement = text.childNodes[1];
        }
      else
        {
          this.titleElement = text.childNodes[0];
        }

      result.appendChild (text);

      this.focusDOM = text;

      this.attachEvent (result, 'click', 'onClickHandler');

      $(result).disableTextSelect ();
      $(result).mousedown (wrapMeth (this, 'doOnPress'));
      $(result).mouseup   (wrapMeth (this, 'doOnRelease'));
      $(result).mouseout  (wrapMeth (this, 'doOnMouseOut'));

      return result;
    };

  /****
   * Event handlers
   */
  this.onClickHandler = function (event)
    {
      stopEvent (event);

      if (this.sensitive && this.onClick)
        {
          this.onClick (event);
        }
    };

  /**
   * Events'stubs
   */
  this.onClick   = function (event) {}
  this.onPress   = function () {}
  this.onRelease = function () {}

  /**
   * Getters/setters
   */

  /**
   * Get button's image
   */
  this.getImage = function ()
    {
      return this.image;
    };

  /**
   * Set button's image
   */
  this.setImage = function (image)
    {
      this.image = image;

      if (this.imageElement)
        {
          this.imageElement.src = image;
        }
      else
        {
          this.rebuild ();
        }
    };

  /**
   * Get button's title
   */
  this.getTitle = function ()
    {
      return this.title;
    };

  /**
   * Set button's title
   */
  this.setTitle = function (title)
    {
      this.title = title;
      this.titleElement.innerHTML = title;
    };

  /**
   * Handle button was pressed down event
   */
  this.doOnPress = function ()
    {
      if (this.sensitive)
        {
          this.dom.addClass ('UIButtonPressed');
          this.onPress ();
        }
    };

  /**
   * Handle button was released event
   */
  this.doOnRelease = function ()
    {
      if (this.sensitive)
        {
          this.dom.removeClass ('UIButtonPressed');
          this.onRelease ();
        }
    };

  /**
   * Handle button was released event
   */
  this.doOnMouseOut = function ()
    {
      this.dom.removeClass ('UIButtonPressed');
    };
}

function UIButton (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  /* Title which will be displayed */
  this.title = defVal (opts['title'], '');

  /* User's defined click handler */
  if (opts['click'])
    {
      this.onClick = opts['click'];
    }

  /* Button's image */
  this.image = opts['image'];

  this.titleElement = null; /* DOM element for title */
  this.imageElement = null; /* DOM element for image */

  this.insensitiveClassName = 'UIButtonInsensitive';
}

UIButton.prototype = new _UIButton;
UIButton.prototype.constructor = UIButton;
