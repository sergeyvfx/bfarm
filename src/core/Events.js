/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

var KEY_CANCEL = 3;
var KEY_HELP = 6;
var KEY_BACK_SPACE = 8;
var KEY_TAB = 9;
var KEY_CLEAR = 12;
var KEY_RETURN = 13;
var KEY_ENTER = 14;
var KEY_SHIFT = 16;
var KEY_CONTROL = 17;
var KEY_ALT = 18;
var KEY_PAUSE = 19;
var KEY_CAPS_LOCK = 20;
var KEY_ESCAPE = 27;
var KEY_SPACE = 32;
var KEY_PAGE_UP = 33;
var KEY_PAGE_DOWN = 34;
var KEY_END = 35;
var KEY_HOME = 36;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_PRINTSCREEN = 44;
var KEY_INSERT = 45;
var KEY_DELETE = 46;
var KEY_0 = 48;
var KEY_1 = 49;
var KEY_2 = 50;
var KEY_3 = 51;
var KEY_4 = 52;
var KEY_5 = 53;
var KEY_6 = 54;
var KEY_7 = 55;
var KEY_8 = 56;
var KEY_9 = 57;
var KEY_SEMICOLON = 59;
var KEY_EQUALS = 61;
var KEY_A = 65;
var KEY_B = 66;
var KEY_C = 67;
var KEY_D = 68;
var KEY_E = 69;
var KEY_F = 70;
var KEY_G = 71;
var KEY_H = 72;
var KEY_I = 73;
var KEY_J = 74;
var KEY_K = 75;
var KEY_L = 76;
var KEY_M = 77;
var KEY_N = 78;
var KEY_O = 79;
var KEY_P = 80;
var KEY_Q = 81;
var KEY_R = 82;
var KEY_S = 83;
var KEY_T = 84;
var KEY_U = 85;
var KEY_V = 86;
var KEY_W = 87;
var KEY_X = 88;
var KEY_Y = 89;
var KEY_Z = 90;
var KEY_CONTEXT_MENU = 93;
var KEY_NUMPAD0 = 96;
var KEY_NUMPAD1 = 97;
var KEY_NUMPAD2 = 98;
var KEY_NUMPAD3 = 99;
var KEY_NUMPAD4 = 100;
var KEY_NUMPAD5 = 101;
var KEY_NUMPAD6 = 102;
var KEY_NUMPAD7 = 103;
var KEY_NUMPAD8 = 104;
var KEY_NUMPAD9 = 105;
var KEY_MULTIPLY = 106;
var KEY_ADD = 107;
var KEY_SEPARATOR = 108;
var KEY_SUBTRACT = 109;
var KEY_DECIMAL = 110;
var KEY_DIVIDE = 111;
var KEY_F1 = 112;
var KEY_F2 = 113;
var KEY_F3 = 114;
var KEY_F4 = 115;
var KEY_F5 = 116;
var KEY_F6 = 117;
var KEY_F7 = 118;
var KEY_F8 = 119;
var KEY_F9 = 120;
var KEY_F10 = 121;
var KEY_F11 = 122;
var KEY_F12 = 123;
var KEY_F13 = 124;
var KEY_F14 = 125;
var KEY_F15 = 126;
var KEY_F16 = 127;
var KEY_F17 = 128;
var KEY_F18 = 129;
var KEY_F19 = 130;
var KEY_F20 = 131;
var KEY_F21 = 132;
var KEY_F22 = 133;
var KEY_F23 = 134;
var KEY_F24 = 135;
var KEY_NUM_LOCK = 144;
var KEY_SCROLL_LOCK = 145;
var KEY_COMMA = 188;
var KEY_PERIOD = 190;
var KEY_SLASH = 191;
var KEY_BACK_QUOTE = 192;
var KEY_OPEN_BRACKET = 219;
var KEY_BACK_SLASH = 220;
var KEY_CLOSE_BRACKET = 221;
var KEY_QUOTE = 222;
var KEY_META = 224;

/**
 *  Get event's target element
 */
function eventTarget (event)
{
  var evt = event || window.event;
  var targ = evt.target || evt.srcElement;

  if (targ.nodeType == 3)
    {
      targ = targ.parentNode
    }

  return targ;
}

/**
 *  Get event's relatedTarget element
 */
function relatedTarget (event)
{
  var evt = event || window.event;

  return (event.relatedTarget) ? event.relatedTarget : event.toElement;
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

function isSpecialKeyEvent(event)
{
  var code = event.which || event.charCode || eventkeyCode || 0;

  if (code <= KEY_ESCAPE || (code >= KEY_PAGE_UP && code <= KEY_DELETE) ||
      code == KEY_CONTEXT_MENU || (code >= KEY_F1 && code <= KEY_SCROLL_LOCK ||
      code == KEY_QUOTE || code == KEY_META))
    {
      return true;
    }

  return false;
}
