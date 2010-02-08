/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIButton (opts)
{
  opts = opts || {};

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

      var text = voidLink (innerHTML/*, {'canfocus': false} */);

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

      this.handleSensitive ();

      this.handleSensitive (result);

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
  this.onClick = function (event) {}

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
   * Setter of sensitive attribute
   */
  this.setSensitive = function (sensitive)
    {
      UIButton.prototype.setSensitive.call (this, sensitive);
      this.handleSensitive ();
    };

  /**
   * Handle sensitive attribute
   */
  this.handleSensitive  = function (dom)
    {
      dom = dom || this.dom;

      if (!dom)
        {
          return;
        }

      if (this.sensitive)
        {
          $(dom).removeClass ('UIButtonInsesitive');
        }
      else
        {
          $(dom).addClass ('UIButtonInsesitive');
        }
    };

  /* Title which will be displayed */
  this.title = opts['title'];

  /* User's defined click handler */
  if (opts['click'])
    {
      this.onClick = opts['click'];
    }

  /* Button's image */
  this.image = opts['image'];

  this.titleElement = null; /* DOM element for title */
  this.imageElement = null; /* DOM element for image */
}

UIButton.prototype = new UIWidget;
UIButton.prototype.constructor = UIButton;
