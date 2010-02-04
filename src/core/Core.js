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
      for (var key in Element.prototype)
        element[key] = Element.prototype[key];
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
}

if (!Array.indexOf)
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

/**
 * Get DOM element's absolute position
 */
Element.prototype.offset = function ()
{
  return $(this).offset ();
};

