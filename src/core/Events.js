/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

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
