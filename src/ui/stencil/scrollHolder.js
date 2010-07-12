/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function buildScrollHolder (opts)
{
  opts = opts || {};

  var jqHolder = null;
  var position = defVal (opts['position'], '');
  var paddings = defVal (opts['paddings'], {'top'    : 0,
                                            'bottom' : 0,
                                            'left'   : 0,
                                            'right'  : 0});

  var dom = ($('<div></div>')
      .css ('display', 'table')
      .append($('<div></div>')
                .css ('display', 'table-cell')
                .css ('height', '100%')
                .append ((jqHolder = $('<div></div>'))
                         .css ('overflow', 'auto')
                         .css ('position', position)
                         .css ('top',      paddings.top + 'px')
                         .css ('bottom',   paddings.bottom + 'px')
                         .css ('left',     paddings.left + 'px')
                         .css ('right',    paddings.right + 'px')
                        )
             )) [0];

  dom['holder'] = jqHolder[0];

  return dom;
};
