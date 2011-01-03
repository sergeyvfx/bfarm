/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIFileEntry ()
{
  _UIWidget.call (this);

  this.createFileInput = function ()
    {
      var input = createElement ('INPUT');

      input.type = 'file';
      input.className = 'UIFileEntry';
      input.onchange = wrapMeth (this, 'doOnChange');

      this.fileInput = input;

      return input;
    };

  /**
   * Build DOM tree for entry
   */
  this.doBuild = function ()
    {
      var div = createElement ('DIV');

      div.className = 'UIFileEntry';

      var btn = new UIButton({'title': 'Browse', 'width': 80, 'image': 'pics/buttons/browse.gif'});
      dom = btn.build ();

      var label = createElement ('SPAN');
      label.className = 'UIFileEntry_label';

      this.createFileInput ();

      if ($.browser.mozilla || $.browser.opera)
        {
          this.inputHolder = dom;
          $(btn.dom).mousemove (function (self) { return function (event) { self.onMouseMove (event); } } (this));

          if ($.browser.opera)
            {
              this.fileInput.onmousedown = function (btn) { return function (event) { btn.doOnPress (); stopEvent (event); } } (btn);
            }
        }
      else
        {
          btn.onClick = wrapMeth (this, 'onClick');
          this.inputHolder = div;
          div.appendChild (btn.dom);
        }

      this.inputHolder.appendChild (this.fileInput);

      div.appendChild (btn.dom);
      div.appendChild (label);

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

  this.doOnChange = function ()
    {
      this.updateLabel ();
      this.onChange ();
      this.updateBinding ();
    };

  this.updateBinding = function ()
    {
      if (this.binding)
        {
          var binding = $(this.binding);

          binding.each (function (source) { return function () {
                var newInput = source;

                source.parentNode.removeChild (source);

                newInput.id = this.id;
                newInput.name = this.name;
                newInput.className = '';

                /* copy styles */
                if (typeof this.style.length != 'undefined')
                  {
                    for (var i = 0; i < this.style.length; ++i)
                      {
                        var s = this.style[i];
                        newInput.style[s] = this.style[s];
                      }
                  }
                else
                  {
                    for (var s in this.style)
                      {
                        var v = this.style[s];

                        if (s == 'cssText' || v == '')
                          {
                            continue;
                          }

                        if (typeof v == 'string' || typeof v == 'number')
                          {
                            newInput.style[s] = v;
                          }
                      }
                  }

                this.parentNode.replaceChild (newInput, this);
              }
            } (this.fileInput));

          this.createFileInput ();
          this.inputHolder.appendChild (this.fileInput);
        }
    };

  /* callback stubs */
  this.onChange = function () {};
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
