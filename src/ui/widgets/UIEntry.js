/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIEntry (opts)
{
  _UIWidget.call (this);

  /**
   * Build editable entry
   */
  this.buildEntry = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIEntry';

      /* Draw image */
      if (this.image)
        {
          result.className += ' UIEntryWImage';

          var img = createElement ('IMG');
          img.src = this.image;
          result.appendChild (img);
        }

      /* Draw text entry */
      var innerDiv = createElement ('DIV');
      innerDiv.className = 'UIEntryInputHolder';

      result.appendChild (innerDiv);

      innerDiv.innerHTML = '<input type="text">';

      /* Set element for gaining focus and store text holder */
      var input = innerDiv.childNodes[0];
      this.inputElement = input;
      this.focusDOM = input;

      this.attachEvent (input, 'keyup', 'keyUpHandler');

      input.value = this.text;

      this.prevText = this.text;

      return result;
    };

  /**
   * Build read-only text entry
   */
  this.buildReadonly = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIReadonlyEntry';

      /* Draw image */
      if (this.image)
        {
          result.className += ' UIEntryROWImage';

          var img = createElement ('IMG');
          img.src = this.image;
          result.appendChild (img);
        }

      this.textElement = createElement ('SPAN');
      this.textElement.innerHTML = this.text;
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
   * Get image
   */
  this.getImage = function ()
    {
      return this.image;
    };

  /**
   * Set image
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
   * Check changes made by user
   */
  this.checkChanges = function ()
    {
      var text = this.validateChanging (this.inputElement.value);

      if (text == null)
        {
          text = this.prevText;
        }

      this.inputElement.value = text;

      if (text != this.prevText)
        {
          this.text = this.prevText = text;
          this.doOnChanged (text);
        }
    };

  /**
   * Event handlers
   */
  this.keyUpHandler = function (event)
    {
      this.checkChanges ();
    };

  /**
   * Validation function
   */
  this.validateChanging = function (text)
    {
      return text;
    }

  /**
   * CORE-side handler of value changed event
   */
  this.doOnChanged = function (newText)
    {
      this.onChanged (newText);
    };

  /***
   * Event stubs
   */
  this.onChanged = function (newText) {};

}

/***
 * Constructor
 */
function UIEntry (opts)
{
  opts = opts || {};
  UIWidget.call (this, opts);

  this.stopEvents = this.stopEvents.concat (['click']);

  /* DOM elements which are holding text */
  this.inputElement = null
  this.textElement = null;

  /* Text etrie's image */
  this.image = opts['image'];

  /* Text, displayed in entry */
  this.text = isUnknown (opts['text']) ? '' : opts['text'];
  this.prevText = null;
}

UIEntry.prototype = new _UIEntry;
UIEntry.prototype.constructor = UIEntry;
