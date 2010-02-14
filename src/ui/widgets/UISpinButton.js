/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UISpinButton ()
{
  _UIEntry.call (this);

  /**
   * Create spin button
   */
  this.createButton = function (position)
    {
      var button = createElement ('DIV');
      var arr = createElement ('DIV');

      button.className = 'UISpinButtonBtn UISpinButtonBtn' + position;
      arr.className = 'UISpinButtonBtnArr';
      button.appendChild (arr);

      $(button).mousedown (function (self, direction) {return function (event) {
            self.onBtnMouseDown (event, direction);
          };
        } (this, position == 'Left' ? -1 : 1));

      var handler = function (self) {return function () {
            self.stopAffecting ();
          };
        } (this);

      $(button).mouseup (handler);
      $(button).mouseout (handler);

      return button;
    }

  /**
   * Build editable entry
   */
  this.buildEntry = function ()
    {
      var result = UIEntry.prototype.buildEntry.call (this);

      if (result)
        {
          $(result).addClass ('UISpinButton');
          if (this.image)
            {
              $(result).addClass ('UISpinButtonWImage');
            }

          var entryHolder = createElement ('DIV');
          entryHolder.className = 'UISpinEntryHolder'; 
          moveAllNodes (result, entryHolder);

          result.appendChild (this.createButton ('Left'));
          result.appendChild (this.createButton ('Right'));

          result.appendChild (entryHolder);
        }

      return result;
    };

  /**
   * Build DOM for widget
   */
  this.build = function ()
    {
      this.text = this.valueToText (this.value);
      return UIEntry.prototype.build.call (this);
    };

  /**
   * Get validated value
   */
  this.validateValue = function ()
    {
      this.value = Math.max (this.value, this.min);
      this.value = Math.min (this.value, this.max);

      this.updateText ();
    }

  /**
   * Check value validness
   */
  this.checkValue = function (value)
    {
      return value >= this.min && value <= this.max;
    };

  /**
   * Validation function
   */
  this.validateChanging = function (text)
    {
      text = text.trim ().replace (/\.+$/, '.');

      if (text == '.')
        {
          return '0.';
        }

      if (text == '' || text == '-' || text.match (/^\-?[0-9]+\.$/))
        {
          return text;
        }

      var value = parseFloat (text);
      if (this.checkValue (value))
        {
          return '' + value;
        }

      return null;
    }

  /**
   * Convert value to text
   */
  this.valueToText = function ()
    {
      return '' + this.value;
    }

  /**
   * Handler of mouse down on spin button
   */
  this.onBtnMouseDown = function (event, direction)
    {
      var evt = event || window.event;

      if (evt.which == 1)
        {
          this.affecting = true;
          this.affectValue (direction, true);
        }
    };

  /**
   * Affect onto value
   */
  this.affectValue = function (direction, firstTime)
    {
      if (!this.affecting)
        {
          return;
        }

      var newValue = this.value + this.step * direction;
      if (!this.checkValue (newValue))
        {
          return;
        }

      var oldValue = this.value;
      this.value = newValue;
      this.updateText ();

      this.doOnChanged (null, oldValue);

      var handler = function (self, direction) {
          return function () {
            self.affectValue (direction);
          };
        } (this, direction);

        this.affectTimeout = window.setTimeout (handler,
                                 firstTime ? UISpinButton.FIRST_AFFECT_TIME :
                                           UISpinButton.AFFECT_TIME)
    };

  /**
   * Stop affecting onto value by mouse button stick
   */
  this.stopAffecting = function ()
    {
      if (this.affectTimeout)
        {
          window.clearTimeout (this.affectTimeout);
          this.affectTimeout = null;
        }

      this.affecting = false;
    };

  /**
   * Update text displayed in widget
   */
  this.updateText = function ()
    {
      this.setText (this.valueToText ());
    };

  /**
   * CORE-side handler of value changed event
   */
  this.doOnChanged = function (newText, oldValue)
    {
      var oldValue = isUnknown (oldValue) ? null : oldValue;
      if (newText == null)
        {
          newText = '' + this.value;
        }
      else
        {
          newText = newText ? newText : '0';
          this.value = parseFloat (newText);
          if (isNaN (this.value))
            {
              this.value = 0;
            }
        }

      this.onChanged (newText);

      if (this.value != oldValue)
        {
          this.onValueChanged (this.value);
        }
    };

  /****
   * Getters/setters
   */

  /**
   * Get value
   */
  this.getValue = function ()
    {
      return this.value;
    };

  /**
   * Set value
   */
  this.setValue = function (value)
    {
      this.value = value;
      this.validateValue ();
    };

  /**
   * Get value step
   */
  this.getStep = function ()
    {
      return this.step;
    };

  /**
   * Set value step
   */
  this.setStep = function (step)
    {
      this.step = step;
    };

  /**
   * Get minimum
   */
  this.getMin = function ()
    {
      return this.min;
    };

  /**
   * Set minimum
   */
  this.setMin = function (min)
    {
      this.min = min;
      this.validateValue ();
    };

  /**
   * Get maximum
   */
  this.getMax = function ()
    {
      return this.max;
    }

  /**
   * Set maximum
   */
  this.setMax = function (max)
    {
      this.max = max;
      this.validateValue ();
    };

  /****
   * Stubs
   */

  this.onValueChanged = function (newValue) {};
}

function UISpinButton (opts)
{
  opts = opts || {};

  UIEntry.call (this, opts);

  /* Current spin button value */
  this.value = 0;

  /* Step amount */
  this.step = 1;

  /* Flag for sticked mouse value affecting */
  this.affecting = false;

  this.affectTimeout = null;

  /* Minimum value */
  this.min = defVal (opts['min'], -100);

  /* Maximum value */
  this.max = defVal (opts['max'], 100);
}

UISpinButton.FIRST_AFFECT_TIME = 700;
UISpinButton.AFFECT_TIME = 20;

UISpinButton.prototype = new _UISpinButton;
UISpinButton.prototype.constructor = UISpinButton;
