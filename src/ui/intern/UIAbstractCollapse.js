/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIAbstractCollapse ()
{
  _UIAbstractGroup.call (this);

  /**
   * Build DOM tree for container
   */
  this.doBuild = function ()
    {
      var result = UIAbstractGroup.prototype.doBuild.call (this);

      this.buildHandleCollapse ();

      return result;
    };

  /* Getters/setters */

  /**
   * Get collapsed flag
   *
   * @return true if group is collapsed
   */
  this.getCollapsed = function ()
    {
      return this.collapsed;

      if (!this.handleCollapse ())
      {
        this.rebuild ();
      }
    };

  /**
   * Set collapsed flag
   *
   * @param collapsed - is group collapsed
   */
  this.setCollapsed = function (collapsed)
    {
      this.collapsed = collapsed;

      if (!this.handleCollapse ())
        {
          this.rebuild ();
        }
    };

  /**
   * Tweak some node's classNames after build
   */
  this.tweakStyles = function ()
    {
      this.containerDom.style.display = '';

      if (this.collapsed)
        {
          if (this.collapsedContainerClass)
            {
              $(this.containerDom).removeClass (this.expandedContainerClass);
              $(this.containerDom).addClass (this.collapsedContainerClass);
            }
          else
            {
              this.containerDom.style.display = 'none';
            }

          if (this.headerDom)
            {
              $(this.headerDom).removeClass (this.expandedHeaderClass);
              $(this.headerDom).addClass (this.collapsedHeaderClass);
            }
        }
      else
        {
          $(this.containerDom).removeClass (this.collapsedContainerClass);
          $(this.containerDom).addClass (this.expandedContainerClass);

          if (this.headerDom)
            {
              $(this.headerDom).removeClass (this.collapsedHeaderClass);
              $(this.headerDom).addClass (this.expandedHeaderClass);
            }
        }
    };

  /**
   * Build-time custom handler of collapsed flag changed
   */
  this.buildHandleCollapse = function ()
    {
    };

  /**
   * Run-time custom handler of collapsed flag changed
   * If this method return false, box will be fully re-created
   *
   * @return false if collapse changed hasn't been handled, true otherwise
   */
  this.handleCollapse = function ()
    {
      if (this.animated)
        {
          this.preAnimTweak ();
          $(this.containerDom).animate ({height: 'toggle'},
                                        this.animationSpeed,
                                        wrapMeth (this, 'postAnimTweak'));

          return true;
        }

      return false;
    };

  /**
   * Collapse group
   */
  this.collapse = function ()
    {
      if (!this.collapsed)
        {
          this.setCollapsed (true);
        }
    };

  /**
   * Expand group
   */
  this.expand = function ()
    {
      if (this.collapsed)
        {
          this.setCollapsed (false);
        }
    };

  /**
   * Collapse group
   */
  this.toggleCollapse = function ()
    {
      if (!this.collapsed)
        {
          this.collapse ();
        }
      else
        {
          this.expand ();
        }
    };

  /**
   * Post-animation style tweaking
   */
  this.postAnimTweak = function ()
    {
      this.tweakStyles ();
    };

  /**
   * Pre-animation style tweaking
   */
  this.preAnimTweak = function ()
    {
    };
}

/***
 * Constructor
 */
function UIAbstractCollapse (opts)
{
  opts = opts || {};
  UIAbstractGroup.call (this, opts);

  /* is box collapsed */
  this.collapsed = defVal (opts['collapsed'], false);

  /* should collapsing/expanding be animated */
  this.animated = defVal (opts['animated'], false);

  /* Speed of animation */
  this.animationSpeed = defVal (opts['animationSpeed'], 150);

  /* Class name for collapsed container */
  this.collapsedContainerClass = '';

  /* Class name for expanded container */
  this.expandedContainerClass = '';

  /* Class name for collapsed header */
  this.collapsedHeaderClass = '';

  /* Class name for expanded header */
  this.expandedHeaderClass = '';
}

UIAbstractCollapse.prototype = new _UIAbstractCollapse;
UIAbstractCollapse.prototype.constructor = UIAbstractCollapse;
