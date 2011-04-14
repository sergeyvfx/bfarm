/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIRadioGroup ()
{
  _UIContainer.call (this);

  this.buildChild = function (index)
    {
      var item = this.get (index);
      var btn = new UIToggleButton ({'title': item['title'],
                                     'image': item['image'],
                                     'toggled': this.value == item['value']});

      btn.onToggle = function (self) { return function () {
            self.onButtonToggled (this, index);
          }
        } (this);

      this.buttons.push (btn);

      return btn.build ();
    };

  this.onButtonToggled = function (btn)
    {
      for (var i = 0; i < this.buttons.length; ++i)
        {
          var item = this.get (i);
          var cur = this.buttons[i];

          if (btn == cur)
            {
              this.value = item['value'];
              this.updateBinding (this.value);
              cur.setToggled (true);
            }
          else
            {
              cur.setToggled (false);
            }
        }
    };

  this.getHolders = function ()
    {
      var itemsRow;

      this.buttons = [];

      var dom = ($('<div></div>')
                   . addClass ('UIRadioGroup')
                   . append ($('<table></table>')
                              . addClass ('UIRadioGroupItemsHolder')
                              . append (itemsRow =  $('<tr></tr>'))
                            )
                ) [0];

      var holders = [];
      for (var i = 0, n = this.length (); i < n; ++i)
        {
          var item = this.get (i);
          var holder = ($('<td></td>')
                         . addClass ('UIRadioGroupItemHolder')
                       ) [0];

          if (n > 1)
            {
              if (i == 0)
                {
                  holder.addClass ('UIRadioGroupItemFirstHolder');
                }
              else if (i == n - 1)
                {
                  holder.addClass ('UIRadioGroupItemLastHolder');
                }
            }
          else
            {
              holder.addClass ('UIRadioGroupItemLonelyHolder');
            }

          itemsRow.append (holder)

          holders.push (holder);
        }

      return {'dom': dom, 'holders': holders};
    };

  /**
   * get current value
   */
  this.getValue = function ()
    {
      return this.value;
    };

  /**
   * Set current value
   */
  this.setValue = function (value)
    {
      this.value = value;
      this.rebuild ();
    };
}

function UIRadioGroup (opts)
{
  opts = opts || {};

  UIContainer.call (this, opts);

  this.value = defVal (opts['value'], null);

  // XXX: need better integration for other widgets
  if (opts['items'])
    {
      for (var i = 0; i < opts['items'].length; ++i)
        {
          this.add (opts['items'][i]);
        }
    }

  /* internal use -- array of buttons used for variants */
  this.buttons = [];
}

UIRadioGroup.prototype = new _UIRadioGroup;
UIRadioGroup.prototype.constructor = UIRadioGroup;
