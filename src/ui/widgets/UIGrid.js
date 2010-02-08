/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function UIGrid (opts)
{
  opts = opts || {};

  this.getHolders = function ()
    {
      var table = createElement ('TABLE');
      var tbody = createElement ('TBODY');
      var holders = [];
      var paddingString = getSpacingStr (this.padding);

      table.className = 'UIGrid';
      table.appendChild (tbody);

      for (var i = 0; i < this.rows; ++i)
        {
          var tr = createElement ('TR');
          tr.className = 'UIGridRow';
          addNumberClass (tr, i, this.rows, 'UIGridRow');

          for (var j = 0; j < this.cols; ++j)
            {
              var td = createElement ('TD');
              td.className = 'UIGridCell';
              addNumberClass (td, j, this.cols, 'UIGridCell');

              if (paddingString)
                {
                  td.style.padding = paddingString;
                }

              holders.push (td);

              tr.appendChild (td);
            }

          tbody.appendChild (tr);
        }

      return {'dom': table, 'holders': holders};
    };

  /****
   * Getters/setters
   */

  /**
   * Get rows count
   */
  this.getRows = function ()
    {
      return this.rows;
    };

  /**
   * Set rows count
   */
  this.setRows = function (rows)
    {
      if (rows >= 1)
        {
          this.rows = rows;
          this.rebuild ();
        }
    };

  /**
   * Get cols count
   */
  this.getCols = function ()
    {
      return this.cols;
    };

  /**
   * Set cols count
   */
  this.setCols = function (cols)
    {
      if (cols >= 1)
        {
          this.cols = cols;
          this.rebuild ();
        }
    };

  /****
   * Constructor
   */

  /* Number of rows */
  this.rows = opts['rows'] || 1;

  /* Number of columns */
  this.cols = opts['cols'] || 1;

  /* Default cell padding */
  this.padding = defVal (opts['padding'], 0);
}

UIGrid.prototype = new UIContainer;
UIGrid.prototype.constructor = UIGrid;
