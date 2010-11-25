/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIPanelBox ()
{
  _UICollapseBox.call (this);

  /**
   * Tweak some node's classNames after build
   */
  this.tweakStyles = function ()
    {
      UICollapseBox.prototype.tweakStyles.call (this);

      /* nice integration to UI panel  */
      var p = this.getParent ();
      if (p instanceof UIPanel)
        {
          /* XXX: hacky checking */
          if (!p.hasHeader () && p.get (0) == this)
            {
              this.headerDom.addClass ('UIPanelBoxFirstHeader');
              this.headerDom.parentNode.addClass ('UIPanelBoxFirst ');
            }
        }
    };
}

function UIPanelBox (opts)
{
  /* prefix for all class names */
  this.classNamePrefix = 'UIPanelBox';

  UICollapseBox.call (this, opts);

  /* Class name for outer DOM node */
  this.outerClassName = 'UIPanelBox';

  /* Sources for expand/collapse images */
  this.collapseImageSrc = UI_PREFI + 'pics/elem/panelbox_expand.gif';
  this.expandImageSrc = UI_PREFIX + 'pics/elem/panelbox_collapse.gif';
}

UIPanelBox.prototype = new _UIPanelBox;
UIPanelBox.prototype.constructor = UIPanelBox;
