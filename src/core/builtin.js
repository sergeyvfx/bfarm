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
