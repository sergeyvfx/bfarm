/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function _UIGrid ()
{
  _UIContainer.call (this);

  /**
   * Clear all custom styles from cell
   */
  this.clearCellStyle = function (cell)
    {
      cell.colSpan = 1;
      cell.style.padding = getSpacingStr (this.padding);
    };

  /**
   * Apply custom styles to cell
   */
  this.applyCellStyle = function (cell, i, j)
    {
      var style = this.getCellStyle (i, j);
      if (style)
        {
          cell.colSpan       = defVal (style['colspan'], 1);
          if (!isUnknown (style['padding']))
            {
              cell.style.padding = getSpacingStr (style['padding']);
            }

          if (!isUnknown (style['width']))
            {
              cell.style.width = uiUtil.sizeToStyle (style['width']);
            }

          if (!isUnknown (style['height']))
            {
              cell.style.height = uiUtil.sizeToStyle (style['height']);
            }

          if (!isUnknown (style['valign']))
            {
              cell.style.verticalAlign = style['valign'];
            }

          if (!isUnknown (style['align']))
            {
              cell.style.verticalAlign = style['align'];
            }
        }
      else
        {
          this.clearCellStyle (cell);
        }
    };

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

          var m = this.cols;
          for (var j = 0; j < m; ++j)
            {
              var td = createElement ('TD');
              td.className = 'UIGridCell';
              addNumberClass (td, j, this.cols, 'UIGridCell');

              if (paddingString)
                {
                  td.style.padding = paddingString;
                }

              this.applyCellStyle (td, i, j);

              if (td.colSpan > 1)
                {
                  m -= td.colSpan - 1;
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

  /**
   * Set specified cell's style
   */
  this.setCellStyle = function (row, column, style)
    {
      if (!this.cellStyles)
        {
          this.cellStyles = {};
        }

      if (!this.cellStyles[row])
        {
          this.cellStyles[row] = {};
        }

      this.cellStyles[row][column] = style;

      this.rebuild ();
    };

  /**
   * Get specified cell's style
   */
  this.getCellStyle = function (row, column, style)
    {
      return this.cellStyles && this.cellStyles[row] ?
          this.cellStyles[row][column] : null;
    };

  /**
   * Clear all cell-specified styles
   */
  this.clearCellStyles = function ()
    {
      this.cellStyles = null;
      this.rebuild ();
    };
}

/****
 * Constructor
 */
function UIGrid (opts)
{
  opts = opts || {};
  UIContainer.call (this, opts);

  /* Number of rows */
  this.rows = opts['rows'] || 1;

  /* Number of columns */
  this.cols = opts['cols'] || 1;

  /* Default cell padding */
  this.padding = defVal (opts['padding'], 0);

  /* Cell-specified styles */
  this.cellStyles = defVal (opts['cellStyles'], null);
}

UIGrid.prototype = new _UIGrid;
UIGrid.prototype.constructor = UIGrid;
