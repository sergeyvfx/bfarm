/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIGroupBox ()
{
  _UIAbstractGroup.call (this);

  /**
   * Build box's header
   *
   * @return DOM node for header
   */
  this.buildHeader = function ()
    {
      if (!this.title)
        {
          return null;
        }

      var header = createElement ('DIV');

      header.appendChild (createTextNode (this.title));
      header.className = 'UIGroupBoxHeader';

      $(header).disableTextSelect ();

      return header;
    };

  /**
   * Tweak classNames after build
   */
  this.tweakStyles = function ()
    {
      if (this.title)
        {
          this.outerDom.addClass ('UIGroupBoxTitled');
          this.containerDom.addClass ('UIGroupBoxContainerTitled');
        }
    };

  /* Getters/setters */

  /**
   * Get group box title
   *
   * @param return group box's title
   */
  this.getTitle = function ()
    {
      return this.title;
    };


  /**
   * Set group box title
   *
   * @param title - new title
   */
  this.setTitle = function (title)
    {
      this.title = defVal (title, '');

      if (!this.headerDom || !this.title)
        {
          this.rebuild ();
        }
      else
        {
          this.headerDom.innerHTML = '';
          this.headerDom.appendChild (createTextNode (this.title));
        }
    };
}

function UIGroupBox (opts)
{
  UIAbstractGroup.call (this, opts);

  /* Group box title */
  this.title = defVal (opts['title'] || '');

  /* Class name for outer DOM node */
  this.outerClassName = 'UIGroupBox';

  /* Class name for widget container node */
  this.contanerClassName = 'UIGroupBoxContainer';
}

UIGroupBox.prototype = new _UIGroupBox;
UIGroupBox.prototype.constructor = UIGroupBox;
