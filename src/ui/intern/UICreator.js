/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UICreator ()
{
  _IObject.call (this);

  /**
   * Create UI widget subtree from JSON object
   */
  this.fromJSON = function (json)
    {
      json = json || {};

      if (json._uiWidget)
        {
          return json._uiWidget;
        }

      if (isUnknown (json['class']))
        {
          return null;
        }

      var className = 'UI' + json['class'];

      if (isUnknown (window[className]))
        {
          return null;
        }

      var widget = new window[className] (json);

      if (typeof widget.add == 'function' && json['childs'])
        {
          for (var i = 0, n = json['childs'].length; i < n; ++i)
            {
              var c = json['childs'][i];

              if (widget.widgetField)
                {
                  c[widget.widgetField] = this.create (c[widget.widgetField]);
                }

              widget.add (this.create (c));
            }
        }

      if (json['events'])
        {
          widget.attachEvents (json['events']);
        }

      json._uiWidget = widget;
      return widget;
    };

  /**
   * Create UI widget subtree from packed specifier
   */
  this.create = function (obj)
    {
      if (obj instanceof Object && obj['class'])
        {
          return this.fromJSON (obj);
        }
      else if (typeof obj == 'string')
        {
          if (obj.match (/^url\:\/\//))
            {
              var url = obj.replace (/^url\:\/\//, '');
              var str = $.ajax({url: url, async: false, dataType: 'text', cache: false}).responseText;
              var json = $.parseJSON (str);
              return this.fromJSON (json);
            }
        }

      return obj;
    };
}

function UICreator ()
{
  IObject.call (this);
}

UICreator.prototype = new _UICreator;
UICreator.prototype.constructor = UICreator;

var uiCreator = new UICreator ();
