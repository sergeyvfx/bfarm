/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/***
 * Hack for sucky IE
 */

if (!window.Element)
{
  Element = function () {}

  function _ (element)
    {
      if (!element)
        {
          return null;
        }

      for (var key in Element.prototype)
        {
          element[key] = Element.prototype[key];
        }

      return element;
    }

  var handle = ['createElement', 'getElementById',
                'getElementsByTagName', 'getElementsByName'];

  for (var i = 0, n = handle.length; i < n; ++i)
    {
      var h = handle[i];
      document['__' + h] = document[h];
      document[h] = function (h) {return function (x) {
           return _(document['__' + h] (x));
          }
        } (h);
    }

  var _$ = $;
  $ = function (selector) {
    var result = _$ (selector);
    result.each (function (i) { _(this); } );
    return result;
  }

  for (var k in _$)
    {
      $[k] = _$[k];
    }
}

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(obj)
    {
      for (var i = 0; i < this.length; i++)
        {
          if (this[i] == obj)
            {
              return i;
            }
        }

      return -1;
    }
}

/******
 * Default functions overriding
 */

function setEmbedHandlers (node)
  {
    var handle = ['appendChild', 'insertAfter', 'insertBefore'];

    for (var i = 0, n = handle.length; i < n; ++i)
      {
        var h = handle[i];

        if (!node[h])
          {
            continue;
          }

        node['__' + h] = node[h];

        node[h] = function (h) { return function (a, b) {
              var result = this['__' + h] (a, b);

              if (a.uiWidget)
                {
                  var f = a.uiWidget.postEmbedTweaks;

                  if (typeof f == 'function')
                    {
                      f.call (a.uiWidget);
                    }
                }

              return result;
            };
          } (h);
      }

    return node;
  }

{
  if (!window.HTMLDocument)
    {
      var oldDocCreateElement = document.createElement;
      document.createElement = function (elem)
        {
          return setEmbedHandlers (oldDocCreateElement (elem));
        }
    }
  else
    {
      var oldHTMLDocCreateElement = HTMLDocument.prototype.createElement;
      HTMLDocument.prototype.createElement = function (elem)
        {
          return setEmbedHandlers (oldHTMLDocCreateElement.call (this, elem));
        }
    }

  $(document).ready (function () {
      setEmbedHandlers (document.body);
    });
}

/**
 * Get DOM element's absolute position
 */
Element.prototype.offset = function ()
{
  return $(this).offset ();
};

/**
 * Get DOM element's outer width
 */
Element.prototype.outerWidth = function ()
{
  return $(this).outerWidth ();
};

/**
 * Get DOM element's outer height
 */
Element.prototype.outerHeight = function ()
{
  return $(this).outerHeight ();
};

/**
 * Get DOM element's height (could be called)
 */
Element.prototype.getHeight = function ()
{
  return uiUtil.getItemHeight (this);
};

/**
 * Check DOM element've got parent node
 */
Element.prototype.hasParent = function ()
{
  return $(this).parent () [0];
};

/**
 * Remove all child nodes
 */
Element.prototype.removeAllNodes = function ()
{
  removeAllNodes (this);
};

/**
 * Push new node as first child
 */
Element.prototype.pushFront = function (node)
{
  if (this.childNodes.length)
    {
      $(node).insertBefore ($(this.childNodes[0]));
    }
  else
    {
      this.appendChild (node);
    }
};

/**
 * Add class to node
 */
Element.prototype.addClass = function (className)
{
  return $(this).addClass (className);
};

/**
 * Remove class from node
 */
Element.prototype.removeClass = function (className)
{
  return $(this).removeClass (className);
};

/**
 * Trim spaces from string
 */
String.prototype.trim = function()
{
  return this.replace(/^\s+|\s+$/g, '');
}

/**
 * Round number to specified number of decimal digits
 */
Number.prototype.toFixed = function (dec) {
  return roundNumber (this, dec);
}
