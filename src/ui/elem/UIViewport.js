/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIViewport ()
{
  _UIWidget.call (this);

  /**
   * Build DOM tree for button
   */
  this.doBuild = function ()
    {
      /* Viewport holder */
      var result = createElement ('DIV');
      result.className = 'UIViewportHolder';

      /* Viewport */
      var viewport = createElement ('DIV');
      viewport.className = 'UIViewport';
      this.viewport = viewport;

      result.appendChild (viewport);

      /* Items holder */
      var itemsHolder = createElement ('UL');
      itemsHolder.className = 'UIViewportItemsHolder';
      this.itemsHolder = itemsHolder;

      viewport.appendChild (itemsHolder);

      this.buildPanels ();

      return result;
    };

  /* Viewport */

  /**
   * Get viewport div
   */
  this.getViewport = function ()
    {
      return this.viewport;
    };

  /* Panels */

  /**
   * Build specified panel
   *
   * @param panel - panel to be builded
   */
  this.buildPanel = function (panel)
    {
      if (!this.dom)
        {
          return;
        }

      var dom = panel.build ();
      this.dom.appendChild (dom);
    };

  /**
   * Build all panels
   */
  this.buildPanels = function ()
    {
      for (var pos in this.panels)
        {
          this.buildPanel (this.panels[pos]);
        }
    };

  /**
   * Add new panel
   *
   * @param pos - panel's position
   * @return new panel object
   */
  this.addPanel = function (position)
    {
      if (this.panels[position])
        {
          /* Panel was already created */
          return;
        }

      var panel = new UIViewportPanel ({'parent': this,
                                        'position': position});
      this.panels[position] = panel;

      this.buildPanel (panel);

      return panel;
    };

  /* items */

  /**
   * Build specified item
   *
   * @param item - item to be build
   */
  this.buildItem = function (item)
    {
      if (!this.itemsHolder)
        {
          return;
        }

      var dom = item.build ();
      this.itemsHolder.appendChild (dom);
    };

  /**
   * Build all items
   */
  this.buildItems = function ()
    {
      for (var i = 0, n = this.items.length; i < n; ++i)
        {
          this.buildItem (this.items[i]);
        }
    };

  /**
   * Add new item
   *
   * @param image - item's image
   * @param caption - item's caption
   * @return new item object
   */
  this.addItem = function (image, caption, exec)
    {
      var item = new UIViewportItem ({'parent' : this,
                                      'image'  : image,
                                      'caption': caption,
                                      'exec'   : exec});

      this.items.push (item);
      this.buildItem (item);

      return item;
    };

  /**
   * Get viewport's zindex object
   *
   * @return viewport's zindex object
   */
  this.getZIndex = function ()
    {
      return this.zIndex;
    };
}

function UIViewport (opts)
{
  UIWidget.call (this, opts);

  /* Register main viewport */
  if (uiMainViewport == null)
    {
      uiMainViewport = this;
    }

  this.viewport = null;
  this.itemsHolder = null;

  this.panels = [];
  this.items = [];

  this.zIndex = new UIZIndex ();
}

UIViewport.prototype = new _UIViewport;
UIViewport.prototype.constructor = UIViewport;

var uiMainViewport = null;
