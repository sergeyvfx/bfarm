/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

/******
 * Default functions overriding
 */

function setEmbedHandlers (node)
  {
    var handle = ['appendChild', 'insertAfter', 'insertBefore'];

    for (var i = 0, n = handle.length; i < n; ++i)
      {
        var h = handle[i];

        if (!node[h])
          {
            continue;
          }

        node['__' + h] = node[h];

        node[h] = function (h) { return function (a, b) {
              var result = this['__' + h] (a, b);

              if (a.uiWidget)
                {
                  var f = a.uiWidget.postEmbedTweaks;

                  if (typeof f == 'function')
                    {
                      f.call (a.uiWidget);
                    }
                }

              return result;
            };
          } (h);
      }

    return node;
  }

if (!window.HTMLDocument)
  {
    var oldDocCreateElement = document.createElement;
    document.createElement = function (elem)
      {
        return setEmbedHandlers (oldDocCreateElement (elem));
      }
  }
else
  {
    var oldHTMLDocCreateElement = HTMLDocument.prototype.createElement;
    HTMLDocument.prototype.createElement = function (elem)
      {
        return setEmbedHandlers (oldHTMLDocCreateElement.call (this, elem));
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
 * Create text node
 */
function createTextNode (text)
{
  return document.createTextNode (text);
}
/**
 * Remove all nodes from node
 */
function removeAllNodes (node)
{
  while (node.childNodes.length)
    {
      var node = node.childNodes[0];
      node.removeChild (node);
    }
}

/**
 * Move all nodes from source to destination
 */
function moveAllNodes (src, dst)
{
  while (src.childNodes.length)
    {
      var node = src.childNodes[0];
      src.removeChild (node);
      dst.appendChild (node);
    }
}

/**
 * Create link with void href
 */
function voidLink(content, opts)
{
  var result = createElement ('A');

  result.href = 'JavaScript:Void(0)';

  var blurCallback = function ()
    {
      window.setTimeout (function (link) { return function () { link.blur (); }; } (this), 1)
    };

  $(result).mousedown (blurCallback);
  $(result).click (blurCallback);

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
      result.canFocus = defVal (opts['canFocus'], true);
    }

  return  result;
}

/**
 * Check node is in tree
 */
function nodeInTree(node, tree)
{
  var cur = node;

  while (cur)
    {
      if (cur == tree)
        {
          return true;
        }

      cur = cur.parentNode;
    }

  return false;
}

/**
 * Remove node from DOM tree
 *
 * @param node - node to be removed
 */
function removeNode(node)
{
  if (!node || !node.parentNode)
    {
      return;
    }

  node.parentNode.removeChild (node);
}

/**
 * Append float terminator
 *
 * @param where - where float should be terminated
 */
function floatTerm (where)
{
  var floatTerm = createElement ('DIV');
  floatTerm.className = 'floatTerm';
  where.appendChild (floatTerm);
}

/**
 * Check if node in document's DOM
 *
 * @param node - node to check
 */
function isNodeEmbedded (node)
{
  var oldID = node.id;

  if (isUnknown (document.embedCounter))
    {
      document.embedCounter = 0;
    }

  node.id = '__chechEmbed' + (document.embedCounter++);

  var result = document.getElementById (node.id);

  node.id = oldID;

  return result != null;
}
