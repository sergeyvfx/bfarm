/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UILabel (opts)
{
  _UIWidget.call (this);

  /**
   * Build DOM tree for entry
   */
  this.doBuild = function ()
    {
      var div = createElement ('DIV');
      div.className = 'UILabel';

      div.appendChild (createTextNode (this.text));

      this.applyStyle (div);

      return div;
    };

  /***
   * Different getters/setters
   */

  /**
   * Get text
   */
  this.getText = function ()
    {
      return this.text;
    };

  /**
   * Set text
   */
  this.setText = function (text)
    {
      this.text = text;

      if (this.dom)
        {
          this.dom.removeAllNodes ();
          this.dom.appendChild (createTextNode (text));
        }
    };

  /**
   * Apply different styles (bold, etc..)
   */
  this.applyStyle = function (where)
    {
      where = where || this.dom;

      if (this.bold)
        {
          where.style.fontWeight = 'bold';
        }
      else
        {
          where.style.fontWeight = '';
        }

      if (this.color)
        {
          where.style.color = this.color;
        }

      if (this.background)
        {
          where.style.background = this.background;
        }
    };
}

/***
 * Constructor
 */
function UILabel (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  /* Text, displayed in label */
  this.text = isUnknown (opts['text']) ? '' : opts['text'];

  /* Foreground color */
  this.color = defVal (opts['color'], null);

  /* Background color */
  this.background = defVal (opts['background'], null);

  /* Should text be bold */
  this.bold = defVal (opts['bold'], false);
}

UILabel.prototype = new _UILabel;
UILabel.prototype.constructor = UILabel;
