/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

var COMBOBOX_VARIANTS_TIMEOUT = 200;

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
              if (item.image && !this.editable)
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
   * Get text with stripped auto-guessed part
   */
  this.stripAutoGuess = function ()
    {
      var input = this.textHolder;

      if (input.autoGuessed)
        {
          var i = Math.min (input.tmpSelectionStart, input.tmpSelectionEnd);

          if (i < 0)
            {
              i = Math.min (input.selectionStart, input.selectionEnd);
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
                    self.showPopup ();
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
  this.doInputAutoGuess = function ()
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

      input.autoGuessed = false;

      /* if item was found.. */
      if (fullText != '')
        {
          this.setActive (fullItem);

          input.value = fullText;
          input.selectionStart = prefix.length;
          input.selectionEnd = fullText.length;
          input.autoGuessed = true;
        }
    };

  /**
   * Get list of items which would be displayed in auto-guess list
   */
  this.getVariantsList = function ()
    {
      var input = this.textHolder;
      var prefix = this.stripAutoGuess ().toLowerCase ();
      var items = [];
      var relevant = {};

      for (var i = 0; i < this.list.length(); i++)
        {
          var item = this.list.get (i);
          var text = item.toString ().toLowerCase ();
          var pos = text.indexOf (prefix);

          if (pos >= 0)
            {
              relevant[item] = pos;
              items.push (item);
            }
        }

      if (items.length == 0)
        {
          return null;
        }

      items.sort (function (relevant) { return function (a, b) {
          return relevant[a] - relevant[b];
        }; } (relevant));

      var list = null;

      if (this.popupList)
        {
          list = this.popupList.list;
        }
      else
        {
          list = new UIList ({'transparent': true});

          list.onItemSelected = function (comboBox) { return function (itemIndex) {
                var item = this.get (itemIndex);
                var index = indexOf (comboBox.getItems (), item);
                comboBox.list.setActive (item);
                comboBox.onListItemSelected (index);
              }
            } (this);

           list.onItemClicked = function (comboBox) { return function (itemIndex) {
                var item = this.get (itemIndex);
                var index = indexOf (comboBox.getItems (), item);
                comboBox.list.setActive (item);
                comboBox.onListItemClicked (index);
             }
           } (this);
        }

      list.clear ();
      for (var i = 0; i < items.length; i++)
        {
          list.add (items[i]);
        }

      return list;
    };

  /**
   * Show list of auto-guessed items -- "outer" interface
   */
  this.showVariantsList = function ()
    {
      if (!this.showVariantsEnabled)
        {
          return;
        }

      if (this.variantsListTimeout)
        {
          window.clearTimeout (this.variantsListTimeout);
        }

      this.variantsListTimeout = window.setTimeout (function (self) {return function ()
          {
            self.doShowVariantsList ();
            self.variantsListTimeout = null;
          }
        } (this), COMBOBOX_VARIANTS_TIMEOUT);
    };

  /**
   * Show list of auto-guessed items -- "inner" logic
   */
  this.doShowVariantsList = function ()
    {
      var list = this.getVariantsList ()

      if (list)
        {
          var item = this.getItemFromText();

          this.denyTextUpdate ();
          list.setActive (item);
          this.allowTextUpdate ();

          if (!this.isPupListShown ())
            {
              this.showPopup (list);
            }
          else
            {
              this.updatePopup ();
            }
        }
      else
        {
          this.hidePopup ();
        }
    };

  this.onInputKeyUp = function (event)
    {
      var input = this.textHolder;
      var prefix = input.value.toLowerCase ();
      var code = event.keyCode;

      if (code == KEY_UP || code == KEY_DOWN)
        {
          /* This keys were handled in keyDown event */
          return;
        }

      /* Notfing to do with empty text aera */
      if (prefix.length == 0)
        {
          input.autoGuessed = false;
          this.updateBindingFromText ();
          this.hidePopup ();
          return;
        }

      if (input.autoGuessed)
        {
          if (code == KEY_ESCAPE)  /* Cancel auto-guessed text */
            {
              input.value = this.stripAutoGuess ();

              this.updateBindingFromText ();
              input.autoGuessed = false;

              input.selectionStart = input.selectionEnd = input.value.length;
              input.focus();

              this.hidePopup ();

              stopEvent (event);
              return;
            }
          else if (code == KEY_RETURN)  /* Accept auto-guessed text */
            {
              input.selectionStart = input.selectionEnd = input.value.length;
              input.tmpSelectionStart = input.tmpSelectionEnd = -1;

              this.updateBindingFromText ();
              this.hidePopup ();

              stopEvent (event);
              return;
            }
        }
      else
        {
          if (code == KEY_RETURN)
            {
              this.hidePopup ();
              this.updateBindingFromText ();
            }
        }

      input.tmpSelectionStart = input.tmpSelectionEnd = -1;

      var guess = input.selectionStart == input.selectionEnd &&
                  input.selectionStart == prefix.length;

      guess &= !isSpecialKeyEvent (event);

      if (guess)
        {
          this.doInputAutoGuess ();
        }

      if (input.tmpAutoValue != this.stripAutoGuess () ||
          input.tmpValue != input.value)
        {
          this.showVariantsList ();
        }

      this.updateBindingFromText ();
    };

  this.onInputKeyDown = function (event)
    {
      var input = this.textHolder;
      var code = event.keyCode;

      input.tmpSelectionStart = input.selectionStart;
      input.tmpSelectionEnd = input.selectionEnd;
      input.tmpAutoValue = this.stripAutoGuess ();
      input.tmpValue = input.value

      if (code == KEY_UP || code == KEY_DOWN)
        {
          if (!this.isPupListShown ())
            {
              this.showPopup ();
            }
          else
            {
              var list = this.popupList.list;
              var index = list.getActiveIndex ();

              if (code == KEY_DOWN)
                {
                  index++;
                  if (index >= list.length ())
                    {
                      index = 0;
                    }
                }
              else
                {
                  index--;
                  if (index < 0)
                    {
                      index = list.length () - 1;
                    }
                }

              input.internalChange = true;
              list.setActiveIndex (index);
              input.internalChange = false;
            }

          stopEvent (event);
          return false;
        }
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

      $(input).keydown (function (self) { return function (e) {

            return self.onInputKeyDown (e);
          }} (this));

      $(input).keyup (function (self) { return function (e) {
            var result = self.onInputKeyUp (e);
            this.tmpSelectionStart = this.tmpSelectionEnd = -1;

            return result;
          }
        } (this));

      $(input).change (function (self) { return function (e) {
            if (this.internalChange)
              {
                return;
              }

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
                self.showPopup ();
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
  this.showPopup = function (list)
    {
      if (!this.dom)
        {
          return;
        }

      if (this.isPupListShown ())
        {
          this.hidePopup ();
          return;
        };

      var puplist = this.buildPupList (list);
      var pos = this.getPupPos ();

      this.popupList = puplist;
      this.popupList.list = list || this.list;

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
   * Update popup content and shadow
   */
  this.updatePopup = function ()
    {
      this.popupList.list.rebuild ();
      this.validateShadowSize ();
    };

  /**
   * Hide drop down list
   */
  this.hidePopup = function () {
    if (this.variantsListTimeout)
      {
        window.clearTimeout (this.variantsListTimeout);
        this.variantsListTimeout = null;
      }

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
  this.buildPupContent = function (where, list) {
    where.appendChild (list.build ());
  };

  /**
   * Build popup list
   */
  this.buildPupList = function (list)
    {
      var result = createElement ('DIV');

      var container = createElement ('DIV');
      var bLayer = createElement ('DIV');
      var dim = this.getPupDim ();

      list = defVal (list, this.list);

      result.className = 'UIComboBoxPupList';
      bLayer.className = 'UIComboBoxPupListBLayer';
      container.className = 'UIComboBoxPupListContainer';

      result.style.width  = dim['width'] + 'px';
      result.style.height = dim['height'] ? dim['height'] + 'px' : '';

      result.appendChild (bLayer);
      result.appendChild (container);
      this.buildPupContent (container, list);

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
      this.hidePopup ();

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
      this.dom.addClass ('UIComboboxPopup');
      this.validateShadowSize ();
    };

  /**
   * Handler of popup list was hidden event
   */
  this.onPupHide = function ()
    {
      this.dom.removeClass ('UIComboboxPopup');
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
          this.hidePopup ();
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
          return this.stripAutoGuess ();
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

  /**
   * get list of all items
   */
  this.getItems = function ()
    {
      return this.list.getContainer ();
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

  /* Shouw variants when typing */
  this.showVariantsEnabled = defVal (opts['showVariants'], false);

  /* internal use: disable text update when setting active list element */
  this.textUpdateDisabled = false;

  /* internal use: timeout for displaying list of variants */
  this.variantsListTimeout = null;

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
