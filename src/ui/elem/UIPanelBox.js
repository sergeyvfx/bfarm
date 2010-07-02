/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIPanelBox ()
{
  _UICollapseBox.call (this);

}

function UIPanelBox (opts)
{
  /* prefix for all class names */
  this.classNamePrefix = 'UIPanelBox';

  UICollapseBox.call (this, opts);

  /* Class name for outer DOM node */
  this.outerClassName = 'UIPanelBox';

  /* Sources for expand/collapse images */
  this.collapseImageSrc = 'pics/ui/elem/panelbox_expand.gif';
  this.expandImageSrc = 'pics/ui/elem/panelbox_collapse.gif';
}

UIPanelBox.prototype = new _UIPanelBox;
UIPanelBox.prototype.constructor = UIPanelBox;
