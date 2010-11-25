/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UICollapseBox ()
{
  _UIAbstractCollapse.call (this);

  /**
   * Create holder for custom header item
   *
   * @param where - where item holder should be created
   * @return item holder
   */
  this.createHeaderItemHolder = function (where)
    {
      var holder = createElement ('TD');
      holder.className = this.headerItemHolderClassName;

      if (where.childNodes.length == 0)
        {
          holder.className += ' ' + this.headerFIrstItemHolderClassName;
        }

      where.appendChild (holder);
      return holder;
    };

  /**
   * Begin new holder row for header items
   *
   * @param where - where holder should be appended to
   * @return container where items should be created
   */
  this.beginHeaderRow = function (where, block)
    {
      var table = createElement ('TABLE');
      table.className = this.headerRowHolderClassName;

      if (block)
        {
          table.className += ' ' + this.headerBlockRowHolderClassName;
        }

      $(table).append('<tbody><tr></tr></tbody>');
      where.appendChild (table);

      return table.rows[0];
    };

  /**
   * If u want to create custom header's elements -- override this function
   *
   * @param where - where item holder should be created
   */
  this.createCustomHeaders = function (where, holder)
    {
      var block = false;

      for (var i = 0, n = this.headerItems.length; i < n; ++i)
        {
          var it = this.headerItems[i];

          if (it.block)
            {
              holder = this.beginHeaderRow (where, true);
              block = true;
            }
          else if (block)
            {
              holder = this.beginHeaderRow (where);
              block = false;
            }

          var itemHolder = this.createHeaderItemHolder (holder);
          var dom = it;

          if (it.build)
            {
              dom = it.build ();
            }

          if (!it.block && it.width)
            {
              itemHolder.style.width = it.width;
            }

          itemHolder.appendChild (dom);
        }
    };

  /**
   * Build box's header
   *
   * @return DOM node for header
   */
  this.buildHeader = function ()
    {
      var header = createElement ('DIV');
      header.className = this.headerClassName;

      var holder = this.beginHeaderRow (header);

      /* Collapse button */
      var btnHolder = this.createHeaderItemHolder (holder);
      var button = createElement ('IMG');
      btnHolder.className = this.collapseButtonHolderClassName;
      button.className = this.collapseButtonClassName;
      btnHolder.appendChild (button);

      /* Box title */
      if (this.title)
        {
          var titleHolder = this.createHeaderItemHolder (holder);
          var title = createElement ('DIV');
          title.className = this.titleHolderClassName;
          title.appendChild (createTextNode (this.title));
          titleHolder.appendChild (title);
        }

      this.createCustomHeaders (header, holder);

      /* Some tweaks */
      $(button).click (wrapMeth (this, 'toggleCollapse'))
      $(header).disableTextSelect ();

      this.collapseButtonDom = button;

      return header;
    };

  /**
   * Pre-animation style tweaking
   */
  this.preAnimTweak = function ()
    {
      if (!this.collapsed && this.headerDom)
        {
          this.headerDom.removeClass (this.collapsedHeaderClass);
          this.headerDom.addClass (this.expandedHeaderClass);
        }
    };

  /* Gettets/setters */

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

      if (!this.headerDom || !this.titleDom || !this.title)
        {
          this.rebuild ();
        }
      else
        {
          this.titleDom.innerHTML = '';
          this.titleDom.appendChild (createTextNode (this.title));
        }
    };

  /**
   * Tweak some node's classNames after build
   */
  this.tweakStyles = function ()
    {
      UIAbstractCollapse.prototype.tweakStyles.call (this);

      if (this.collapsed)
        {
          this.collapseButtonDom.src = this.expandImageSrc;
        }
      else
        {
          this.collapseButtonDom.src=  this.collapseImageSrc;
        }
    };
}

function UICollapseBox (opts)
{
  UIAbstractCollapse.call (this, opts);

  /* Custom header items */
  this.headerItems = defVal (opts['headerItems'], []);

  /* Class name for outer DOM node */
  this.outerClassName = 'UICollapseBox';

  if (isUnknown (this.classNamePrefix))
    {
      /* prefix for all class names */
      this.classNamePrefix = this.outerClassName;
    }

  /* Class name for widget container node */
  this.contanerClassName = this.classNamePrefix + 'Container';

  /* Class name for collapsed header */
  this.collapsedHeaderClass = this.classNamePrefix + 'CollapsedHeader';

  /* Class name for header */
  this.headerClassName = this.classNamePrefix + 'Header';

  /* Class name for collapse button holder */
  this.collapseButtonHolderClassName = this.classNamePrefix + 'CollapseButtonHolder';

  /* Class name for collapse button */
  this.collapseButtonClassName = this.classNamePrefix + 'CollapseButton';

  /* Class name for title holder */
  this.titleHolderClassName = this.classNamePrefix + 'Title';

  /* Class name for header row holder */
  this.headerRowHolderClassName = this.classNamePrefix + 'HeaderRowHolder';

  /* Class name for block row holder */
  this.headerBlockRowHolderClassName = this.classNamePrefix + 'HeaderRowBlockHolder';

  /* Class name for header item holder */
  this.headerItemHolderClassName = this.classNamePrefix + 'HeaderHolder';

  /* Class name for first header item holder */
  this.headerFIrstItemHolderClassName = this.classNamePrefix + 'HeaderFirstHolder';

  /* Box's title */
  this.title = defVal (opts['title'], '');

  /* DOM node for title */
  this.titleDom = null;

  /* DOM node for collapse button */
  this.collapseButtonDom = null;

  /* Sources for expand/collapse images */
  this.collapseImageSrc = 'pics/ui/elem/collapsebox_expand.gif';
  this.expandImageSrc = 'pics/ui/elem/collapsebox_collapse.gif';
}

UICollapseBox.prototype = new _UICollapseBox;
UICollapseBox.prototype.constructor = UICollapseBox;
