/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function isUnknown(obj)
{
  return typeof obj == 'unknown' || !obj;
}

function stopEvent (e)
{
  var evt = e || window.event;

  evt.cancelBubble = true;
  if (evt.stopPropagation)
    {
      evt.stopPropagation ();
    }
}

function createElement (element)
{
  return document.createElement (element);
}

function Void() {}

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
