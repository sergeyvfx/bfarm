/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIAbstractGroup ()
{
  _UIContainer.call (this);

  /**
   * Build box's header
   *
   * @return DOM node for header
   */
  this.buildHeader = function ()
    {
      return null;
    };

  /**
   * Build box's header
   *
   * @return DOM node for footer
   */
  this.buildFooter = function ()
    {
      return null;
    };

  /**
   * Build holders DOM nodes
   */
  this.buildHoldersNodes = function (where)
    {
      return null;
    };

  /**
   * Build main DOM tree and return holders for widgets
   */
  this.getHolders = function ()
    {
      var dom, holders;

      dom = createElement ('DIV');
      dom.className = this.outerClassName;

      /* Build header */
      var header = this.buildHeader ();
      if (header)
        {
          dom.appendChild (header);
        }

      /* Build main content */
      var container = createElement ('DIV');
      container.className = this.contanerClassName;
      dom.appendChild (container);

      hodlers = this.buildHoldersNodes ();
      if (!hodlers)
        {
          holders = [container];
          container.widgetsCount = this.length ();
        }

      /* Build footer */
      var footer = this.buildFooter ();
      if (footer)
        {
          dom.appendChild (footer);
        }

      /* Save DOM nodes */
      this.headerDom    = header;
      this.footerDom    = footer;
      this.containerDom = container;
      this.outerDom     = dom;

      this.tweakStyles ();

      return {'dom': dom, 'holders': holders};
    };

  /**
   * Some group widgets could want to tweak some node's classNames after build
   */
  this.tweakStyles = function ()
    {

    };
}

/***
 * Constructor
 */
function UIAbstractGroup (opts)
{
  opts = opts || {};
  UIContainer.call (this, opts);

  /* Class name for outer DOM node */
  this.outerClassName = '';

  /* Class name for widget container node */
  this.contanerClassName = '';

  /* Some additional stored DOM nodes */
  this.headerDom    = null;
  this.footerDom    = null;
  this.containerDom = null;
  this.outerDom     = null;
}

UIAbstractGroup.prototype = new _UIAbstractGroup;
UIAbstractGroup.prototype.constructor = UIAbstractGroup;
