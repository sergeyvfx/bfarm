/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIFileEntry ()
{
  _UIWidget.call (this);

  /**
   * Build DOM tree for entry
   */
  this.doBuild = function ()
    {
      var div = createElement ('DIV');

      div.className = 'UIFileEntry';

      var btn = new UIButton({'title': 'Browse', 'width': 80});
      dom = btn.build ();

      var label = createElement ('SPAN');
      label.className = 'UIFileEntry_label';

      var input = createElement ('INPUT');
      input.type = 'file';
      input.className = 'UIFileEntry';
      input.onchange = wrapMeth (this, 'updateLabel');

      if ($.browser.mozilla || $.browser.opera)
        {
          dom.appendChild (input);
          $(btn.dom).mousemove (function (self) { return function (event) { self.onMouseMove (event); } } (this));

          if ($.browser.opera)
            {
              input.onmousedown = function (btn) { return function (event) { btn.doOnPress (); stopEvent (event); } } (btn);
            }
        }
      else
        {
          btn.onClick = wrapMeth (this, 'onClick');
          div.appendChild (input);
          div.appendChild (btn.dom);
        }

      div.appendChild (btn.dom);
      div.appendChild (label);

      this.fileInput = input;
      this.button = btn;
      this.label = label;

      this.updateLabel ();

      return div;
    };

  this.onMouseMove = function (event)
    {
      var off = $(this.button.dom).offset ();
      var x = event.pageX - off.left;
      var y = event.pageY - off.top;
      var w = this.fileInput.offsetWidth;
      var h = this.fileInput.offsetHeight;
      var delta_x = w - 30;

      this.fileInput.style.left = x - delta_x + 'px';
      this.fileInput.style.top = y - (h / 2) + 'px';
    };

  this.updateLabel = function ()
    {
      this.label.innerHTML = '';

      if (this.fileInput.value)
        {
          this.label.appendChild (createTextNode (this.fileInput.value));
        }
      else
        {
          this.label.innerHTML = 'Choose file';
        }
    };

  this.onClick = function ()
    {
      this.fileInput.click ();
    };
}

function UIFileEntry (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  this.fileInput = null;
  this.button = null;
  this.label = null;
}

UIFileEntry.prototype = new _UIFileEntry;
UIFileEntry.prototype.constructor = UIFileEntry;
