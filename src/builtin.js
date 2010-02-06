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
