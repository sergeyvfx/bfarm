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
      var prefix = (!this.editable && this.title) ? htmlspecialchars (this.title) + ': ' : '';

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
   * Get item which is corresponds to current full text in entry
   */
  this.getItemFromText = function ()
    {
      var input = this.textHolder;
      var inputText = input.value.toLowerCase ();

      /* find correspond item */
      for (var i = 0; i < this.list.length(); i++)
        {
          var item = this.list.get (i);
          var text = item.toString ().toLowerCase ();

          if (text == inputText)
            {
              return item;
            }
        }

      return null;
    };

  /**
   * Get text with stripped auto-filled part
   */
  this.stripAutoFill = function ()
    {
      var input = this.textHolder;

      if (input.autoFilled)
        {
          var i = Math.min (input.tmpSelectionStart, input.tmpSelectionEnd);

          if (i < 0)
            {
              i = Math.min (input.tmpSelectionStart, input.tmpSelectionEnd);
            }

          return input.value.substring(0, i);
        }
      else
        {
          return input.value;
        }
    };

  /**
   * Update binding from text in entry
   */
  this.updateBindingFromText = function ()
    {
      var item = this.getItemFromText ();

      if (item)
        {
          /* too crappy */
          var value = item.toString ();

          if (!isUnknown (item['tag']))
            {
              value = item['tag'];
            }

          this.updateBinding (value);
        }
      else
        {
          this.denyTextUpdate ();
          this.list.setActiveIndex (-1);
          this.allowTextUpdate ();

          this.updateBinding (this.textHolder.value);
        }
    };

  /**
   * Build DOM tree for read-only container
   */
  this.buildReadonlyContainer = function ()
    {
      var textDiv = createElement ('DIV');
      textDiv.className = 'UIComboBoxText';

      this.textHolder = textDiv;
      this.updateText ();

      if (this.sensitive)
        {
          $(textDiv).mousedown (wrapMeth (this, 'pushButton'));
          $(textDiv).mouseup (wrapMeth (this, 'popButton'));

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
   * Search item with text which starts from
   * entered string and append auto-guess part to input field
   */
  this.doInputAutofill = function ()
    {
      var input = this.textHolder;
      var prefix = input.value.toLowerCase ();
      var fullText = '';
      var fullItem = null;

      /* find correspond item */
      for (var i = 0; i < this.list.length(); i++)
        {
          var item = this.list.get (i);
          var text = item.toString ().toLowerCase ();

          if (text.indexOf (prefix) == 0)
            {
              fullText = text;
              fullItem = item;
              break;
            }
        }

      input.autoFilled = false;

      /* if item was found.. */
      if (fullText != '')
        {
          this.setActive (fullItem);

          input.value = fullText;
          input.selectionStart = prefix.length;
          input.selectionEnd = fullText.length;
          input.autoFilled = true;
        }
    };

  this.onInputKeyUp = function (event)
    {
      var input = this.textHolder;
      var prefix = input.value.toLowerCase ();

      /* Notfing to do with empty text aera */
      if (prefix.length == 0)
        {
          input.autoFilled = false;
          this.updateBindingFromText ();
          return;
        }

      if (input.autoFilled)
        {
          if (event.keyCode == KEY_ESCAPE)  /* Cancel auto-filled text */
            {
              input.value = this.stripAutoFill ();
              this.updateBindingFromText ();
              stopEvent (event);
              input.autoFilled = false;

              input.selectionStart = input.selectionEnd = input.value.length;
              input.focus();
              return;
            }
          else if (event.keyCode == KEY_RETURN)  /* Accept auto-filled text */
            {
              input.selectionStart = input.selectionEnd = input.value.length;
              stopEvent (event);
              this.updateBindingFromText ();
              stopEvent (event);
              return;
            }
        }

      var fill = input.selectionStart == input.selectionEnd &&
                 input.selectionStart == prefix.length;

      fill &= !isSpecialKeyEvent (event);

      if (fill)
        {
          this.doInputAutofill ();
        }

      this.updateBindingFromText ();
    };

  /**
   * Build DOM tree for editable container
   */
  this.buildEditableContainer = function ()
    {
      var inputHolder = createElement ('DIV');
      var input = createElement ('INPUT');

      input.className = 'UIComboboxInput';

      $(input).blur (function (e) { this.tmpSelectionStart = this.tmpSelectionEnd = -1; });

      $(input).keydown (function (e) {
            this.tmpSelectionStart = this.selectionStart;
            this.tmpSelectionEnd = this.selectionEnd;
          });

      $(input).keyup (function (self) { return function (e) {
            self.onInputKeyUp (e);
            this.tmpSelectionStart = this.tmpSelectionEnd = -1;
          }
        } (this));

      $(input).change (function (self) { return function (e) {
            self.updateBindingFromText ();
            this.tmpSelectionStart = this.tmpSelectionEnd = -1;
          }
        } (this));

      inputHolder.className = 'UIComboboxInputHolder';
      inputHolder.appendChild (input);

      this.textHolder = input;
      this.updateText ();

      return inputHolder;
    };

  /**
   * Build DOM tree for container
   */
  this.buildContainer = function ()
    {
      if (this.editable)
        {
          return this.buildEditableContainer ();
        }
      else
        {
          return this.buildReadonlyContainer ();
        }
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

      $(button).mousedown (wrapMeth (this, 'pushButton'));
      $(button).mouseup (wrapMeth (this, 'popButton'));

      $(button).click (function (self) {return function () {
            if (self.sensitive)
              {
                self.doDropDown ();
              }
          }
        } (this));

      $(result).mouseout (function (self) {return function (event) {
            if (self.sensitive)
              {
                self.popButton ();
                self.checkMouseOut (event || window.event);
              }
          };
        } (this));

      if (!this.editable)
        {
          $(result).disableTextSelect ();
        }

      return result;
    };

  /**
   * For nicer shading when mouse is down
   */
  this.pushButton = function ()
    {
      if (this.sensitive)
        {
          $(this.dom).addClass ('UIComboBoxPressed');
        }
    };

  this.popButton = function ()
    {
      if (this.sensitive)
        {
          $(this.dom).removeClass ('UIComboBoxPressed');
        }
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

  this.denyTextUpdate = function ()
    {
      this.textUpdateDisabled = true;
    };

  this.allowTextUpdate = function ()
    {
      this.textUpdateDisabled = false;
    };

  /**
   * Update text, displayed in combo button
   */
  this.updateText = function ()
    {
      if (!this.textHolder || this.textUpdateDisabled)
        {
          return;
        }

      var text = this.getTextToDisplay ();

      if (this.editable)
        {
          this.textHolder.value = text;
        }
      else
        {
          this.textHolder.innerHTML = text;
        }
    }

  /**
   * Handler of item index was changed in list
   */
  this.onListItemSelected = function (itemIndex)
    {
      this.updateText ();

      if (this.editable && this.textHolder)
        {
          this.textHolder.focus ();
        }

      this.onItemSelected (this.list.get (itemIndex));
    }

  /**
   * Handler of item index was clicked in list
   */
  this.onListItemClicked = function (itemIndex)
    {
      this.hideDropDown ();

      if (this.editable && this.textHolder)
        {
          this.textHolder.focus ();
        }

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

  /**
   * Get text displayed in container
   */
  this.getText = function ()
    {
      if (this.editable)
        {
          return this.stripAutoFill ();
        }
      else
        {
          return this.textHolder.innerHTML;
        }
    };

  /**
   * Set text displayed in container
   */
  this.setText = function (text)
    {
      if (this.editable)
        {
          this.textHolder.value = text;
        }
      else
        {
          this.textHolder.innerHTML = htmlspecialchars(text);
        }
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

  /* Could text be edited */
  this.editable = defVal (opts['editable'], false);

  /* internal use: disable text update when setting active list element */
  this.textUpdateDisabled = false;

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
