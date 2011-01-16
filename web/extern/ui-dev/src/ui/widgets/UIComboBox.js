/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIComboBox ()
{
  _UIWidget.call (this);

  /**
   * Get text to display in combo button
   */
  this.getTextToDisplay = function ()
    {
      var index = this.list.getActiveIndex ();
      var prefix = this.title ? htmlspecialchars (this.title) + ': ' : '';

      if (index >= 0)
        {
          var item = this.list.get (index);

          if (!isUnknown (item))
            {
              if (item.image)
                {
                  prefix += '<img src="' + htmlspecialchars (item.image) + '">';
                }

              return prefix + htmlspecialchars (item.toString ());
            }
        }

      return prefix;
    };

  /**
   * Build DOM tree for container
   */
  this.buildContainer = function ()
    {
      var textDiv = createElement ('DIV');
      textDiv.className = 'UIComboBoxText';

      this.textHolder = textDiv;
      this.updateText ();

      if (this.sensitive)
        {
          $(textDiv).click (function (self) {return function () {
                if (self.sensitive)
                  {
                    self.doDropDown ();
                  }
              }
            } (this));
        }

      return textDiv;
    };

  /**
   * Build DOM for combo box
   */
  this.doBuild = function ()
    {
      var result = createElement ('DIV');
      result.className = 'UIComboBox';

      var button = createElement ('DIV');
      button.className = 'UIComboBoxButton';

      var arrow = createElement ('DIV');
      arrow.className = 'UIComboBoxButtonArr';
      button.appendChild (arrow);

      result.appendChild (button);

      var container = createElement ('DIV');
      container.className = 'UIComboBoxContainer';
      result.appendChild (container);

      container.appendChild (this.buildContainer ());

      $(button).click (function (self) {return function () {
            if (self.sensitive)
              {
                self.doDropDown ();
              }
          }
        } (this));

      $(result).mouseout (function (self) {return function (event) {
            self.checkMouseOut (event || window.event);
          };
        } (this));

      $(result).disableTextSelect ();

      return result;
    };

  /**
   * Do showing of drop-down list
   */
  this.doDropDown = function ()
    {
      if (!this.dom)
        {
          return;
        }

      if (this.isPupListShown ())
        {
          this.hideDropDown ();
          return;
        };

      var puplist = this.buildPupList ();
      var pos = this.getPupPos ();

      this.popupList = puplist;

      uiPopupManager.popup (puplist, {'pos': pos},
          {'onHide': function (self) {return function () {
                          self.onPupHide ()
                        };
                      } (this),
           'onShow': function(self) { return function () {
                          self.onPupShow ()
                        };
                      } (this)});
    };

  /**
   * Hide drop down list
   */
  this.hideDropDown = function () {
    callOut (function (self) {return function () {
          uiPopupManager.hide (self.popupList);
          self.list.destroyDOM ();
        };
      } (this)
    );
  };

  /**
   * Build content for popup list
   */
  this.buildPupContent = function (where) {
    where.appendChild (this.list.build ());
  };

  /**
   * Build popup list
   */
  this.buildPupList = function ()
    {
      var result = createElement ('DIV');

      var container = createElement ('DIV');
      var bLayer = createElement ('DIV');
      var dim = this.getPupDim ();

      result.className = 'UIComboBoxPupList';
      bLayer.className = 'UIComboBoxPupListBLayer';
      container.className = 'UIComboBoxPupListContainer';

      result.style.width  = dim['width'] + 'px';
      result.style.height = dim['height'] ? dim['height'] + 'px' : '';

      result.appendChild (bLayer);
      result.appendChild (container);
      this.buildPupContent (container);

      $(container).mouseout (function (self) {return function (event) {
              self.checkMouseOut (event || window.event);
            };
          } (this));

      return result;
    };

  /**
   * Get position for popup list
   */
  this.getPupPos = function ()
    {
      var offsetPos = this.dom.offset ();
      var height = this.dom.outerHeight ();
      return {'x': offsetPos['left'],
              'y': offsetPos['top'] + height};
    };

  /**
   * Get dimensions of popup list
   */
  this.getPupDim = function ()
    {
      return {'width'  : this.dom.outerWidth (),
              'height' : 0};
    };

  /**
   * Update text, displayed in combo button
   */
  this.updateText = function ()
    {
      if (!this.textHolder)
        {
          return;
        }

      var text = this.getTextToDisplay ();
      this.textHolder.innerHTML = text;
    }

  /**
   * Handler of item index was changed in list
   */
  this.onListItemSelected = function (itemIndex)
    {
      this.updateText ();
      this.onItemSelected (this.list.get (itemIndex));
    }

  /**
   * Handler of item index was clicked in list
   */
  this.onListItemClicked = function (itemIndex)
    {
      this.hideDropDown ();
      this.onItemClicked (this.list.get (itemIndex));
    };

  /**
   * Validate size of shadow
   */
  this.validateShadowSize = function ()
    {
      if (!this.popupList)
        {
          return;
        }

      var shadow = this.popupList.childNodes[0];
      var content = this.popupList.childNodes[1];

      shadow.style.height = $(content).outerHeight () + 'px';
    };

  /**
   * Handler of popup list was shown event
   */
  this.onPupShow = function ()
    {
      this.dom.addClass ('UIComboboxDropdown');
      this.validateShadowSize ();
    };

  /**
   * Handler of popup list was hidden event
   */
  this.onPupHide = function ()
    {
      this.dom.removeClass ('UIComboboxDropdown');
      this.popupList = null;
    };

  /**
   * Check is popup list is shown
   */
  this.isPupListShown = function ()
    {
      return this.popupList != null;
    };

  /****
   * Getters/setters
   */

  /**
   * Get title
   */
  this.getTitle = function ()
    {
      return this.title;
    };

  /**
   * Set new title
   */
  this.setTitle = function (title)
    {
      this.title = title;
      this.updateText ();
    };

  /**
   * Get hide list on mouse out option
   */
  this.getHideListOnOut = function ()
    {
      return this.hideListOnMouseout;
    };

  /**
   * Set hide list on mouse out option
   */
  this.setHideListOnOut = function (value)
    {
      this.hideListOnMouseout = value;
    };

  /**
   * Do all checking when mouse was leaved combobox or drop down list
   */
  this.checkMouseOut = function (event)
    {
      if (!this.hideListOnMouseout || !this.popupList)
        {
          return;
        }

      var reltg = relatedTarget (event);
      if (!nodeInTree (reltg, this.popupList) && !nodeInTree (reltg, this.dom))
        {
          this.hideDropDown ();
        }

    };

  /****
   * Work with list
   */

  /**
   * Get active item
   */
  this.getActive = function ()
    {
      return this.list.getActive ();
    };

  /**
   * Get active item's index
   */
  this.getActiveIndex = function ()
    {
      return this.list.getActiveIndex ();
    };

  /**
   * Set active item
   */
  this.setActive = function (active)
    {
      this.list.setActive (active);
    }

  /**
   * Set active item index
   */
  this.setActiveIndex = function (index)
    {
      this.list.setActiveIndex (index);
    }

  /**
   * Get active item index
   */
  this.getActiveIndex = function ()
    {
      return this.list.getActiveIndex ();
    };

  /**
   * Update list's dom (if needed)
   */
  this.rebuildList = function ()
    {
      if (!this.list.dom)
        {
          /* nothing to do */
          return;
        }

      this.list.rebuild ();
    };

  /**
   * Add new item to list
   */
  this.add = function (item)
    {
      this.list.add (item);
      this.rebuildList ();
    };

  /**
   * Remove item from list
   */
  this.remove = function (item)
    {
      this.list.remove (item);
      this.rebuildList ();
    };

  /* stubs */
  this.onItemSelected = function (item) {};
  this.onItemClicked  = function (item) {};
}

/****
 * Constructor
 */
function UIComboBox (opts)
{
  opts = opts || {};
  UIWidget.call (this, opts);

  this.stopEvents = this.stopEvents.concat (['click']);

  /* List for displaying items in puplist */
  this.list = new UIList ({'transparent': true,
                           'binding': opts['binding'],
                           'active': opts['active']});

  this.list.onItemSelected = function (comboBox) { return function (itemIndex) {
        comboBox.onListItemSelected (itemIndex);
      }
    } (this);

  this.list.onItemClicked = function (comboBox) { return function (itemIndex) {
        comboBox.onListItemClicked (itemIndex);
      }
    } (this);

  /* Fill items */
  if (opts['items'])
    {
      for (var i = 0, n = opts['items'].length; i < n; ++i)
        {
          this.list.add (opts['items'][i]);
        }
    }

  this.title = defVal (opts['title'], '');

  /* DOM element, which holds text */
  this.textHolder = null;

  /* Pop-upped list */
  this.popupList = null;

  /* Hide popup list when mouse is out from it */
  this.hideListOnMouseout = defVal (opts['hideListOnMouseout'], true);

  this.insensitiveClassName = 'UIComboBoxInsensitive';

  this.events = this.events.concat (['onItemSelected', 'onItemClicked']);
}

UIComboBox.prototype = new _UIComboBox;
UIComboBox.prototype.constructor = UIComboBox;
