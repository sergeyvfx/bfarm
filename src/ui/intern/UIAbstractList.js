/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIAbstractList ()
{
  _UIContainer.call (this);

  /**
   * Process (add class names, events, etc) item's DOM element
   */
  this.processItemDOM = function (itemIndex, dom)
    {
      if (dom == null || isUnknown (dom))
        {
          dom = this.itemsDom[itemIndex];
        }
      else
        {
          this.itemsDom[itemIndex] = dom;

          $(dom).click (function (self, widgetIndex) {return function () {
                self.onItemClicked (widgetIndex);
              }
            } (this, itemIndex))
        }

      dom.className = this.itemClassName;
      if (itemIndex == this.active)
        {
          dom.className += ' ' + this.itemActClassName;
        }
    };

  /**
   * Build DOM tree for button
   */
  this.doBuild = function ()
    {
      var result = UIContainer.prototype.doBuild.call (this);

      //$(result).click (function () {alert (1)});

      return result;
    };

  /**
   * Handler of item's click
   */
  this.onItemClicked = function (itemIndex)
    {
      this.doItemSelect (itemIndex);
    };

  /**
   * Do all what needed after active element changed
   */
  this.doItemSelect = function (itemIndex)
    {
      if (itemIndex == this.active)
        {
          return;
        }

      var prevActive = this.active;
      this.active = itemIndex;

      this.processItemDOM (prevActive);
      this.processItemDOM (this.active);

      this.onItemSelected (this.active);
    }

  /****
   * Getters/setters
   */

  /**
   * Get active element's index
   */
  this.getActive = function ()
    {
      return this.active;
    };

  /**
   * Set active
   */
  this.setActive = function (active)
    {
      this.doItemSelect (active);
    }

  /**
   * Stubs
   */
  this.onItemSelected = function (itemIndex) {};

  /**
   * Destroy widget
   */
  this.destroy = function ()
    {
      delete this.itemsDom;
      this.itemsDom = null;

      UIContainer.prototype.destroy.call (this);
    }
}

/***
 * Constructor
 */
function UIAbstractList (opts)
{
  opts = opts || {};
  UIContainer.call (this);

  /* Class name for list item DOM element */
  this.itemClassName = '';

  /* Class name for active list item DOM element */
  this.itemActClassName = '';

  /* Index of active element */
  this.active = 0;

  /* Array of DOM nodes for all items */
  this.itemsDom = [];
}

UIAbstractList.prototype = new _UIAbstractList;
UIAbstractList.prototype.constructor = UIAbstractList;
