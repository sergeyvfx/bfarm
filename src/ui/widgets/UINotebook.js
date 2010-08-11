/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UINotebook ()
{
  _UIContainer.call (this);

  /**
   * Build header for tabs
   */
  this.buildTabsHeader = function ()
    {
      this.tabsHeader.removeAllNodes ();

      for (var i = 0, n = this.length (); i < n; ++i)
        {
          var tab = this.get (i);

          var h = createElement ('DIV');
          h.className = 'UINotebookHeaderTab';

          h.appendChild (createTextNode (tab['title']));
          $(h).addClass (uiUtil.getContentStyle (i, n,
                                                 'UINotebookHeaderFirstTab',
                                                 'UINotebookHeaderMiddleTab',
                                                 'UINotebookHeaderLastTab',
                                                 'UINotebookHeaderLonelyTab')
                        );
          $(h).click (wrapMeth (this, 'setActiveTab', i));

          if (i == this.activeTab)
            {
              $(h).addClass ('UINotebookHeaderActiveTab');
              act = i;
            }

          this.tabsHeader.appendChild (h);
        }
    };

  this.buildTabContent = function (tab, where)
    {
      if (where.childNodes.length)
        {
          return;
        }

      if (tab['content'])
        {
          if (tab['content'].build)
            {
              where.appendChild (tab['content'].build ());
            }
          else if (tab['content'] instanceof Element)
            {
              where.appendChild (tab['content']);
            }
          else
            {
              where.appendChild (createTextNode (tab['content']));
            }
        }
    };

  /**
   * Build content needed for tabs
   */
  this.buildTabs = function ()
    {
      this.buildTabsHeader ();

      this.tabsBody.removeAllNodes ();

      for (var i = 0, n = this.length (); i < n; ++i)
        {
          var tab = createElement ('DIV');
          tab.className = 'UINotebookTab';

          if (this.getFill ())
            {
              $(tab).addClass ('UINotebookFilledTab');
            }

          if (this.activeTab != i)
            {
              tab.style.display = 'none';
            }
          else
            {
              this.buildTabContent (this.get (i), tab);
            }

          this.tabsBody.appendChild (tab);
        }
    };

  /**
   * Parse tabs' descriptors data
   */
  this.parseTabs = function ()
    {
      this.activeTab = clamp(this.activeTab, 0, this.length ());
    };

  /**
   * Get all holders
   */
  this.getHolders = function ()
    {
      this.parseTabs ();

      var dom = ($('<div></div>')
                   .addClass ('UINotebook')
                   .append ((this.tabsHeader = $('<div></div>'))
                             .addClass ('UINotebookHeader')
                             .disableTextSelect ()
                           )
                   .append ((this.tabsBody = $('<div></div>'))
                             .addClass ('UINotebookBody')
                           )
                ) [0];

      this.tabsHeader = this.tabsHeader[0];
      this.tabsBody = this.tabsBody[0];

      this.buildTabs ();

      var holders = [];

      if (this.getFill ())
        {
          $(this.tabsBody).addClass ('UINotebookFilled');
        }

      return {'dom': dom, 'holders': holders};
    };

  this.setActiveTab = function (index)
    {
      index = clamp(index, 0, this.length ());

      if (index == this.activeTab)
        {
          /* already active */
          return;
        }

      this.tabsHeader.childNodes[this.activeTab].removeClass ('UINotebookHeaderActiveTab');
      this.tabsHeader.childNodes[index].addClass ('UINotebookHeaderActiveTab');

      this.tabsBody.childNodes[this.activeTab].style.display = 'none';
      this.tabsBody.childNodes[index].style.display = '';

      this.activeTab = index;

      this.buildTabContent (this.get (index),
                            this.tabsBody.childNodes[index]);
    };
}

/****
 * Constructor
 */
function UINotebook (opts)
{
  opts = opts || {};
  UIContainer.call (this, opts);

  /* Array with tabs' descriptors */
  this.container = defVal (opts['tabs'], []);

  this.activeTab = defVal (opts['activeTab'], 0);

  this.widgetField = 'content';
}

UINotebook.prototype = new _UINotebook;
UINotebook.prototype.constructor = UINotebook;
