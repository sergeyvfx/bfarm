/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

var
  VP_PANEL_TOP    = 0x01,
  VP_PANEL_LEFT   = 0x02,
  VP_PANEL_BOTTOM = 0x03,
  VP_PANEL_RIGHT  = 0x04;

var
  VP_PANEL_ALPHAS = ['Top', 'Left', 'Bottom', 'Right'];

function _UIViewportPanel ()
{
  _UIContainer.call (this);

  /**
   * Build DOM tree
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');
      var alphaName = VP_PANEL_ALPHAS[this.position - 1];

      result.className = 'UIViewportPanel';
      result.addClass ('UIViewport' + alphaName + 'Panel');

      /* Hack viewport margins */
      var viewport = this.getParent().getViewport();

      if (this.position % 2)
        {
          viewport.style['margin' + alphaName] = $(result).css('height') || '0px';
        }
      else
        {
          viewport.style['margin' + alphaName] = $(result).css('width') || '0px';
        }

      return result;
    }
}

function UIViewportPanel (opts)
{
  UIContainer.call (this, opts);

  this.position = opts['position'];
}

UIViewportPanel.prototype = new _UIViewportPanel;
UIViewportPanel.prototype.constructor = UIViewportPanel;
