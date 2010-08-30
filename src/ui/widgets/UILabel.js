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
    }

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
    }
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
}

UILabel.prototype = new _UILabel;
UILabel.prototype.constructor = UILabel;
