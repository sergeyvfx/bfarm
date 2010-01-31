/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function isUnknown(obj)
{
  return typeof obj == 'unknown' || !obj;
}

function stopEvent (e)
{
  e.cancelBubble = true;
  if (e.stopPropagation)
    {
      e.stopPropagation ();
    }
}
