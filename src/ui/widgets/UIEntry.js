/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIEntry (opts)
{
  UIWidget.call (this, opts);

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

      result.innerHTML += this.text;

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
   * Get text
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

  /***
   * Constructor
   */
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

UIEntry.prototype = new UIWidget;
UIEntry.prototype.constructor = UIEntry;
