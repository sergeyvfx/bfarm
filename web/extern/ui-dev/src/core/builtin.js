/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/**
 * Check if object unknown
 */
function isUnknown(obj)
{
  return typeof obj == 'unknown' || obj == null;
}

/**
 * Stub for hrefs
 */
function Void() {}


/**
 * rReturn value if it's known and def otherwise
 */
function defVal (val, def)
{
  return isUnknown (val) ? def : val;
}

/**
 * Add first, last and lonely classes to element
 */
function addNumberClass (element, i, n, prefix)
{
  var suffix = '';

  if (n == 1)
    {
      suffix = 'Lonely';
    }
  else if (i == 0)
    {
      suffix = 'First'
    }
  else if (i == n - 1)
    {
      suffix = 'Last'
    }

  if (suffix)
    {
      element.className += ' ' + prefix + suffix;
    }
}

/**
 * Get spacing (padding/margin) string for style from option
 */
function getSpacingStr (spacing)
{
  if (isUnknown (spacing))
    {
      return '';
    }

  if (typeof spacing == 'number')
    {
      return spacing + 'px';
    }

  if (spacing.length >= 1 && spacing.length <= 4)
    {
      return spacing.join ('px ') + 'px';
    }

  return '';
}

/**
 * Round number to specified number of decimal digits
 */
function roundNumber (num, dec)
{
  var result = Math.round (Math.round (num * Math.pow (10, dec + 1)) /
      Math.pow (10, 1) ) / Math.pow (10, dec);

  return result;
}

/**
 * Construct arguments hash from argument's names and arguments' values
 */
function mkargs(names, values, additional)
{
  var result = {}

  for (var i = 0, n = Math.min (names.length, values.length); i < n; ++i)
    {
      result[names[i]] = values[i];
    }

  if (additional)
    {
      for (var x in additional)
        {
          result[x] = additional[x];
        }
    }

  return result;
}

/**
 * Wrap function context substitution
 */
function wrap (proc, args)
{
  return function (proc, args) { return function () {
        proc (args);
      };
    } (proc, args);
}

/**
 * Wrap method context substitution
 */
function wrapMeth (obj, proc, args)
{
  return function (obj, proc, args) { return function () {
        obj[proc] (args);
      };
    } (obj, proc, args);
}

/**
 * Wrap method context substitution
 */
function wrapMethDelayed (obj, proc, args)
{
  var callback = function (obj, proc, args) { return function () {
        obj[proc] (args);
      };
    } (obj, proc, args);

  return function (cb) { return function () {
        callOut (cb);
      }
     } (callback)
}
/**
 * Call function outside from current stream
 */
function callOut (proc, args)
{
  window.setTimeout (wrap (proc, args), 5);
}

/**
 * Check could object be interpreted as truth
 */
function isTruth(obj)
{
  if (isUnknown (obj))
    {
      return false;
    }

  if (obj.toLowerCase)
    {
      var l = obj.toLowerCase ();
      return l != '' && l != '0' && l != 'false';
    }

  return (obj) ? true : false;
}

/**
 * Check if object in list
 */
function inside(obj, list)
{
  for (var i = 0; i < list.length; ++i)
    {
      if (list[i] == obj)
        {
          return true;
        }
    }

  return false;
}

/**
 * Clamp value
 */
function clamp(x, min, max)
{
  if (x < min)
    {
      x = min;
    }
  else if (x > max)
    {
      x = max;
    }

  return x;
}

/**
 * index of object in array
 */
function indexOf(arr, obj)
{
  if (arr.indexOf)
    {
      return arr.indexOf (obj);
    }

  for (var i = 0; i < arr.length; i++)
    {
      if (arr[i] == obj)
        {
          return i;
        }
    }

  return -1;
}

/**
 * Remove object from array
 */
function remove(arr, object)
{
  var index = indexOf (arr, object);

  if (index >= 0)
    {
      arr.splice (index, 1);
    }
}
