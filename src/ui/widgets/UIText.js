/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIText (opts)
{
  _UIWidget.call (this);

  /**
   * Build editable entry
   */
  this.buildEntry = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIText';

      /* Draw text entry */
      var innerDiv = createElement ('DIV');
      innerDiv.className = 'UITextInputHolder';

      result.appendChild (innerDiv);

      innerDiv.innerHTML = '<textarea></textarea>';

      /* Set element for gaining focus and store text holder */
      var textArea = innerDiv.childNodes[0];
      this.inputElement = textArea;
      this.focusDOM = textArea;

      this.attachEvent (textArea, 'keyup', 'keyUpHandler');

      textArea.value = this.text;

      if (!this.autoexpand)
        {
          textArea.rows = this.rows;
        }
      else
        {
         textArea.className = 'UITextExpandable';
        }

      this.prevText = this.text;

      if (this.autoexpand)
        {
          this.validateHeight ();
        }

      return result;
    };

  /**
   * Build read-only text entry
   */
  this.buildReadonly = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIReadonlyText';

      this.textElement = createElement ('SPAN');
      this.textElement.innerHTML = this.text.replace (/\r/, '').replace (/$/gmi, '<br>');
      result.appendChild (this.textElement);

      return result;
    };

  /**
   * Build DOM tree for entry
   */
  this.doBuild = function ()
    {
      this.inputElement = null
      this.textElement = null;
      this.focusDOM = null;
      this.prevText = null;

      if (!this.sensitive)
        {
          return this.buildReadonly ();
        }
      else
        {
          return this.buildEntry ();
        }
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

      if (this.inputElement)
        {
          this.inputElement.value = this.text;
        }

      if (this.textElement)
        {
          this.textElement.innerHTML = this.text;
        }

      this.onChanged (text);
    }

  /**
   * Set autoexpand
   */
  this.setAutoexpand = function (autoexpand)
    {
      this.autoexpand = autoexpand;
      this.rebuild ();
    }

  /**
   * Get autoexpand
   */
  this.getAutoexpand = function ()
    {
      return this.autoexpand;
    }

  /**
   * Set min height of autoexpandable text
   */
  this.setMinHeight = function (minHeight)
    {
      this.minHeight = minHeight;
      this.validateHeight ();
    };

  /**
   * Get min height of autoexpandable text
   */
  this.setMinHeight = function (minHeight)
    {
      return this.minHeight;
    };

  /**
   * Set max height of autoexpandable text
   */
  this.setMaxHeight = function (maxHeight)
    {
      this.maxHeight = maxHeight;
      this.validateHeight ();
    };

  /**
   * Get max height of autoexpandable text
   */
  this.setMaxHeight = function (minHeight)
    {
      return this.maxHeight;
    };

  /**
   * Validate textarea's height if widget is auto-expandable
   */
  this.validateHeight = function ()
    {
      if (!this.inputElement)
        {
          return;
        }

      if (!this.autoexpand)
        {
          return;
        }

      if (!$.browser.opera && !$.browser.msie) {
        this.inputElement.style.height = '0px';
      }

      var height = this.inputElement.scrollHeight;

      var e = this.inputElement;
      var s = $(e);

      var minHeight = isUnknown (this.minHeight) ?
          parseInt (s.css ('minHeight')) || 0 : this.minHeight;
      var maxHeight = isUnknown (this.maxHeight) ?
          parseInt (s.css ('maxHeight')) || 0 : this.maxHeight;

      /*
       * TODO: Maybe we should remove setting up overflow style from here
       */

      height = Math.max (height, minHeight);
      if (height >= maxHeight && height != 0)
        {
          height = maxHeight;
          this.inputElement.style.overflow = 'auto';
        }
      else
        {
          this.inputElement.style.overflow = 'hidden';
        }

      if (height != 0)
        {
          this.inputElement.style.height = height + 'px';
        }
    };

  /**
   * Set sensitivity
   */
  this.setSensitive = function (sensitive)
    {
      UIText.prototype.setSensitive.call (this, sensitive);
      this.validateHeight ();
    };

  /**
   * Event handlers
   */

  this.keyUpHandler = function (event)
    {
      if (!this.validateChanging ())
        {
          this.inputElement.value = this.prevText;
        }
      else
        {
          var newText = this.inputElement.value;
          this.text = this.prevText = newText;
          this.onChanged (newText);
        }

      if (this.autoexpand)
        {
          this.validateHeight ();
        }
    };

  /**
   * Validation function
   */
  this.validateChanging = function ()
    {
      return true;
    }

  /***
   * Event stubs
   */
  this.onChanged = function (newText) {};
}

/***
 * Constructor
 */
function UIText (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  this.stopEvents = this.stopEvents.concat (['click']);

  /* Settings for autoexpanding */
  this.autoexpand = opts['autoexpand'];
  this.minHeight = opts['minHeight'];
  this.maxHeight = opts['maxHeight'];

  /* DOM elements which are holding text */
  this.inputElement = null
  this.textElement = null;

  this.rows = (!isUnknown (opts['rows']) && opts['rows'] > 0) ? opts['rows'] : 3;

  /* Text, displayed in entry */
  this.text = isUnknown (opts['text']) ? '' : opts['text'];
  this.prevText = null;
}

UIText.prototype = new _UIText;
UIText.prototype.constructor = UIText;
