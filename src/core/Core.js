/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/***
 * Hack for sucky IE
 */
if (!window.Element)
{
  Element = function () {}

  var __createElement = document.createElement;
  document.createElement = function(tagName)
    {
      var element = __createElement(tagName);

      for (var key in Element.prototype)
        element[key] = Element.prototype[key];

      return element;
    }

  var __getElementById = document.getElementById
  document.getElementById = function(id)
    {
      var element = __getElementById(id);
      for(var key in Element.prototype)
        element[key] = Element.prototype[key];
      return element;
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

