/**
 * Copyright (C) 2010 Sergey I. Sharybin
 */

function buildScrollHolder (opts)
{
  opts = opts || {};
  var ieVersion = $.browser.msie ? parseFloat ($.browser.version) : null;
  var couldDispTable = (ieVersion == null || ieVersion >= 8);

  var jqHolder = null;
  var position = defVal (opts['position'], '');
  var paddings = defVal (opts['paddings'], {'top'    : 0,
                                            'bottom' : 0,
                                            'left'   : 0,
                                            'right'  : 0});

  var dom = ($('<div></div>')
      .css ('display', couldDispTable ? 'table' : '')
      .css ('width',   '100%')
      .append($('<div></div>')
                .css ('display', couldDispTable ? 'table-cell' : '')
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
