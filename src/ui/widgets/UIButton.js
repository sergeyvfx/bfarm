/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIButton (opts)
{
  UIWidget.call (this, opts);

  /**
   * Build DOM tree for button
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIButton';

      var innerHTML = '';
      if (this.image)
        {
          innerHTML += '<img src="' + this.image + '">';
        }
      innerHTML += this.title;

      var text = voidLink (innerHTML/*, {'canfocus': false} */);

      result.appendChild (text);

      this.focusDOM = text;

      this.atttachEvent (result, 'click', 'onClickHandler');

      return result;
    };

  /****
   * Event handlers
   */
  this.onClickHandler = function (event)
    {
      if (this.onClick)
        {
          this.onClick (event);
        }

      stopEvent (event);
    };

  /**
   * Events'stubs
   */
  this.onClick = function (event) {}

  /**
   * Getters/setters
   */

  /**
   * Set button's image
   */
  this.setImage = function (image)
    {
      this.image = image;
      this.rebuild ();
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
}

UIButton.prototype = new UIWidget;
UIButton.prototype.constructor = UIButton;
