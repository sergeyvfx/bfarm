/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIProgress (opts)
{
  _UIWidget.call (this);

  this.getDisplayText = function ()
    {
      if (!this.showTitle)
        {
          return '';
        }

      var text = '';

      if (this.title)
        {
          text += this.title + ': ';
        }

      text += Math.ceil(this.position * 100) + '%';

      return text;
    };

  /**
   * Build DOM tree for progress bar
   */
  this.doBuild = function ()
    {
      var div = createElement ('DIV');
      div.className = 'UIProgress';

      var bar = createElement ('DIV');
      bar.className = 'UIProgressBar';
      div.appendChild (bar);

      bar.style.width = Math.ceil(this.position * 100) + '%';

      var text = this.getDisplayText ();
      if (text)
        {
          var title = createElement ('DIV');
          title.className = 'UIProgressTitle';
          title.appendChild (createTextNode (text));
          div.appendChild (title);
          this.titleDOM = title;
        }
      else
        {
          this.titleDOM = null;
        }

      this.barDOM = bar;

      $(div).disableTextSelect ();

      return div;
    };

  this.getPosition = function ()
    {
      return this.position;
    };

  /**
   * Set bar posotion
   */
  this.setPosition = function (position)
    {
      this.position = clamp (position, 0, 1);

      if (this.barDOM)
        {
          this.barDOM.style.width = Math.ceil(this.position * 100) + '%';
        }

      if (this.titleDOM)
        {
          $(titleDOM).empty ();
          this.titleDOM.appendChild (this.getDisplayText ());
        }
    };

  this.getTitle = function ()
    {
      return this.title;
    };

  this.setTitle = function (title)
    {
      this.title = title;

      if (this.titleDOM)
        {
          $(titleDOM).empty ();
          this.titleDOM.appendChild (this.getDisplayText ());
        }
      else
        {
          this.rebuild ();
        }
    };

  this.getShowTitle = function ()
    {
      return this.showTitle;
    }

  this.setShowTitle = function (showTitle)
    {
      if (this.showTitle != showTitle)
        {
          this.showTitle = showTitle;
          this.rebuild ();
        }
    }
}

/***
 * Constructor
 */
function UIProgress (opts)
{
  opts = opts || {};

  UIWidget.call (this, opts);

  /* is title visible? */
  this.showTitle = defVal (opts['showTitle'], true);

  /* title, displayed in bar */
  this.title = defVal (opts['title'], '');

  /* Position */
  this.position = defVal (opts['position'], 0);
  this.position = clamp (this.position, 0, 1);

  this.stopEvents.push ('click');

  this.barDOM = null;
  this.titlerDOM = null;
}

UIProgress.prototype = new _UIProgress;
UIProgress.prototype.constructor = UIProgress;
