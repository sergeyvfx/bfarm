/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

var __isIE =  navigator.appVersion.match(/MSIE/);
var __userAgent = navigator.userAgent;
var __isFireFox = __userAgent.match(/firefox/i);
var __isFireFoxOld = __isFireFox && 
   (__userAgent.match(/firefox\/2./i) || __userAgent.match(/firefox\/1./i));
var __isFireFoxNew = __isFireFox && !__isFireFoxOld;

/**
 * Get DOM element by it's ID
 */
function getElementById (id)
{
  return document.getElementById (id);
}

/**
 * Attach event to DOM element
 */
function attachEvent(object, event, handler)
{
  if (window.addEventListener)
    {
      object.addEventListener ('' + event, handler, false);
    }
  else
    {
      object.attachEvent ('on' + event, handler);
    }
}

function __parseBorderWidth (width)
{
  var res = 0;

  if (typeof width == 'string' && width != null && width != '')
    {
      var p = width.indexOf ('px');
      if (p >= 0)
        {
          res = parseInt (width.substring (0, p));
        }
      else
        {
          /**
           * FIXME:
           */
          res = 1; 
        }
    }

  return res;
}

function __getBorderWidth (element)
{
  var res = {'left': 0, 'top': 0, 'right': 0, 'bottom': 0};

  if (window.getComputedStyle)
    {
      /* for Firefox */
      var elStyle = window.getComputedStyle (element, null);
      res['left']    = parseInt (elStyle.borderLeftWidth.slice (0, -2));  
      res['top']     = parseInt (elStyle.borderTopWidth.slice (0, -2));  
      res['right']   = parseInt (elStyle.borderRightWidth.slice (0, -2));  
      res['bottom']  = parseInt (elStyle.borderBottomWidth.slice (0, -2));  
    }
  else
    {
      /* for other browsers */
      /**
       * TODO: There was solution for getting computed style in IE/Opera/etc
       */
      res['left']   = __parseBorderWidth (element.style.borderLeftWidth);
      res['top']    = __parseBorderWidth (element.style.borderTopWidth);
      res['right']  = __parseBorderWidth (element.style.borderRightWidth);
      res['bottom'] = __parseBorderWidth (element.style.borderBottomWidth);
    }

  return res;
}

/**
 * Get DOM element's absolute position
 */
function getElementAbsolutePos (element)
{
  var res = {'x': 0, 'y': 0};

  if (element !== null)
    {
      res['x'] = element.offsetLeft;
      res['y'] = element.offsetTop;

      var offsetParent = element.offsetParent;
      var parentNode = element.parentNode;
      var borderWidth = null;

      while (offsetParent != null)
        {
          res['x'] += offsetParent.offsetLeft;
          res['y'] += offsetParent.offsetTop;

          var parentTagName = offsetParent.tagName.toLowerCase ();    

          if ((__isIE && parentTagName != "table") || 
              (__isFireFoxNew && parentTagName == "td"))
            {
              borderWidth = __getBorderWidth (offsetParent);
              res['x'] += borderWidth['left'];
              res['y'] += borderWidth['top'];
            }

            if (offsetParent != document.body &&
                offsetParent != document.documentElement)
              {
                res['x'] -= offsetParent.scrollLeft;
                res['y'] -= offsetParent.scrollTop;
              }

            //next lines are necessary to support FireFox problem with offsetParent
            if (__isFireFox)
              {
                while (offsetParent != parentNode && parentNode !== null)
                  {
                    res['x'] -= parentNode.scrollLeft;
                    res['y'] -= parentNode.scrollTop;

                    if (__isFireFoxOld)
                      {
                        borderWidth = __getBorderWidth (parentNode);
                        res['x'] += borderWidth['left'];
                        res['y'] += borderWidth['top'];
                      }

                    parentNode = parentNode.parentNode;
                  }
              }

            parentNode = offsetParent.parentNode;
            offsetParent = offsetParent.offsetParent;
        }
    }

  return res;
}

function isUnknown(obj)
{
  return typeof obj == 'unknown' || !obj;
}

/**
 * Stop event handling
 */
function stopEvent(e)
{
  e.cancelBubble = true;

  if (e.stopPropagation)
    {
      e.stopPropagation ();
    }

  return e;
}
