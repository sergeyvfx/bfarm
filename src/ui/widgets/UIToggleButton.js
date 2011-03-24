/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIToggleButton ()
{
  _UIButton.call (this);

  /**
   * Set className for node depending on button toggle state
   */
  this.setToggledStyle = function (node)
    {
      node = node || this.dom;

      if (this.toggled)
        {
          node.addClass ('UIToggleButtonToggled');
        }
      else
        {
          node.removeClass ('UIToggleButtonToggled');
        }
    };

  /**
   * Build DOM tree for button
   */
  this.doBuild = function ()
    {
      var dom = UIButton.prototype.doBuild.call (this);
      this.setToggledStyle (dom);
      return dom;
    };

  this.doOnRelease = function ()
    {
      UIButton.prototype.doOnRelease.call (this);

      this.toggled = !this.toggled;

      this.setToggledStyle ();
    };
}

function UIToggleButton (opts)
{
  opts = opts || {};

  UIButton.call (this, opts);

  this.toggled = defVal(opts['toggled'], false);
}

UIToggleButton.prototype = new _UIToggleButton;
UIToggleButton.prototype.constructor = UIToggleButton;
