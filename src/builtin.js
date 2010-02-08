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
 *  Get event's target element
 */
function eventTarget (evt)
{
  var targ = evt.target || evt.srcElement;

  if (targ.nodeType == 3)
    {
      targ = targ.parentNode
    }

  return targ;
}

/**
 * Smart event propagation stopping
 */
function stopEvent (e)
{
  var evt = e || window.event;
  var sender = eventTarget (evt);

  /**
   * This stuff is needed for informing context
   * about event's been stopped
   *
   * This is try to fix problem with popup and clicking on widget,
   * which stops click event
   */
  if (sender)
    {
      var cur = sender;

      /* Find context */
      while (cur && !cur.isUIContext)
        {
          cur = cur.parentNode;
        }

      if (cur)
        {
          /* Context is found */
          if (cur[evt.type + 'Cancel'])
            {
              cur[evt.type + 'Cancel'] (evt);
            }
        }
    }

  evt.cancelBubble = true;
  if (evt.stopPropagation)
    {
      evt.stopPropagation ();
    }
}

/**
 * Create new DOM element
 */
function createElement (element)
{
  return document.createElement (element);
}

/**
 * Stub for hrefs
 */
function Void() {}

/**
 * Create link with void href
 */
function voidLink(content, opts)
{
  var result = createElement ('A');

  result.href = 'JavaScript:Void(0)';

  if (typeof content == 'string')
    {
      result.innerHTML = content;
    }
  else
    {
      result.appendChild (content);
    }

  if (opts)
    {
      if (!opts['canfocus'])
        {
          $(result).click (function () { this.blur (); });
        }
    }

  return  result;
}

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
