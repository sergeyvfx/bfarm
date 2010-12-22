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
   * Get bold flag
   */
  this.getBold = function ()
    {
      return this.bold;
    };

  /**
   * Set bold flag
   */
  this.setBold = function (bold)
    {
      this.bold = bold;
      this.applyStyle ();
    };

  /**
   * Set foreground color
   */
  this.setColor = function (color)
    {
      this.color = color;
      this.applyStyle ();
    };

  /**
   * Get foreground color
   */
  this.getColor = function ()
    {
      return this.color;
    };

  /**
   * Set foreground color
   */
  this.setColor = function (color)
    {
      this.color = color;
      this.applyStyle ();
    };

  /**
   * Get background color
   */
  this.getBackground = function ()
    {
      return this.background;
    };

  /**
   * Set background color
   */
  this.setBackground = function (background)
    {
      this.background = background;
      this.applyStyle ();
    };

  /**
   * Get padding
   */
  this.getPadding = function ()
    {
      return this.padding;
    };

  /**
   * Set padding
   */
  this.setPadding = function (padding)
    {
      this.padding = padding;
      this.applyStyle ();
    };

  /**
   * Apply different styles (bold, etc..)
   */
  this.applyStyle = function (where)
    {
      where = where || this.dom;

      if (!where)
        {
          return;
        }

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
      else
        {
          where.style.color = '';
        }

      if (this.background)
        {
          where.style.background = this.background;
        }
      else
        {
          where.style.background = '';
        }

      if (this.padding)
        {
          where.style.padding = getSpacingStr (this.padding);;
        }
      else
        {
          where.style.padding = '';
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

  /* Inner padding */
  this.padding = defVal (opts['padding'], null);

  /* Should text be bold */
  this.bold = defVal (opts['bold'], false);
}

UILabel.prototype = new _UILabel;
UILabel.prototype.constructor = UILabel;
