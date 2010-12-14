/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UILink (opts)
{
  _UIWidget.call (this);

  /**
   * Build DOM tree for entry
   */
  this.doBuild = function ()
    {
      var div = createElement ('DIV');
      div.className = 'UILink';

      var link = createElement ('A');
      link.href = this.url;
      link.target = this.target;
      link.appendChild (createTextNode (this.text));
      link.onclick = wrapMeth (this, 'onClick');
      this.link = link;

      if (this.image)
        {
          var img = createElement ('IMG');
          img.src = this.image;
          div.appendChild (img);

          this.img = img;
        }

      div.appendChild (link);

      return div;
    };

  /***
   * Different getters/setters
   */

  /**
   * Get text
   */
  this.getText = function ()
    {
      return this.text;
    };

  /**
   * Set text
   */
  this.setText = function (text)
    {
      this.text = text;

      if (this.link)
        {
          this.link.removeAllNodes ();
          this.link.appendChild (createTextNode (text));
        }
    };

  /**
   * Get target
   */
  this.getTarget = function ()
    {
      return this.target;
    };

  /**
   * Set target
   */
  this.setTarget = function (target)
    {
      this.target = target;

      if (this.link)
        {
          this.link.target = target;
        }
    };

  /**
   * Get image
   */
  this.getImage = function ()
    {
      return this.image;
    };

  /**
   * Set image
   */
  this.setImage = function (image)
    {
      this.image = image;

      if (this.img)
        {
          this.img.src = image;
        }
      else if (this.dom)
        {
          this.rebuild ();
        }
    };

  /* stubs */
  this.onClick = function () {};
}

/***
 * Constructor
 */
function UILink (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  /* Text, displayed in label */
  this.text = isUnknown (opts['text']) ? '' : opts['text'];

  /* Image displayed near the link */
  this.image = defVal (opts['image'], null);

  /* URL to link to */
  this.url = defVal (opts['url'], null);

  /* target to open link in */
  this.target = defVal (opts['target'], null);

  /* internal usage */
  this.link = null; /* href dom element */
  this.img  = null; /* img dom element */

  this.stopEvents.push ('click');

  /* events avaliable for attaching */
  this.events = this.events.concat (['onClick']);
}

UILink.prototype = new _UILink;
UILink.prototype.constructor = UILink;
