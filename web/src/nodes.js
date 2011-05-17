/*
 * bfarm renderfarm 0.1pre web interface
 *
 * Copyright 2010, Sergey Sharybin
 * Licensed under the GPL Version 2 license.
 */

var nodes = new function () {
  var attrs = [{'title': 'Identifier', 'field': 'uuid'},
               {'title': 'IP address', 'field': 'ip'},
               {'title': 'Host name',  'field': 'hostname'}]

  var host_attrs = [{'title': 'Archeticture', 'field': 'arch'},
                    {'title': 'Cores',        'field': 'cores'},
                    {'title': 'Platform',     'field': 'platform'},
                    {'title': 'Distributive', 'field': 'dist'}];

  function createNodeBoxHeaderItems(node) {
    var headerItems = [];

    var enableBtn = new UIToggleButton({'title': node.enabled ? 'Enabled' : 'Disabled',
                                        'toggled': node.enabled,
                                        'width': 80});
    enableBtn.right = true;
    enableBtn.onToggle = function () {
        this.setTitle(this.toggled ? 'Enabled' : 'Disabled');
        nodes.setEnabled(node.uuid, this.toggled)
      };
    headerItems.push(enableBtn);

    return headerItems;
  };

  function browseLogs(node) {
    window.open('/logs/node-' + node['uuid'] + '.txt');
  };

  function createNodeBox(node, collapsed) {
    /* XXX: replace with form template */

    var headerItems = createNodeBoxHeaderItems(node);

    var box = new UICollapseBox({'title': node.hostname,
                                 'titleWidth': '30%',
                                 'collapsed': collapsed,
                                 'animated': true,
                                 'name': 'nodeBox_' + node.uuid,
                                 'headerItems': headerItems});

    var attrGrid = new UIGrid({'cols': 2,
                               'padding': 2});
    attrGrid.setCellStyle(0, 0, {'width': 120});

    var index = 0;
    var all_attrs = [attrs, host_attrs];
    var data_src = [node, node['host_info']];

    for (x in all_attrs) {
      var curr_attrs = all_attrs[x];
      var data = data_src[x];

      for(var i = 0; i < curr_attrs.length; i++) {
        var attr = curr_attrs[i];
        var text = data[attr['field']];

        if (isUnknown(text))
          continue;

        if (attr['filter'])
          text = attr['filter'] (text);

        attrGrid.add (new UILabel({'text': attr['title']}));
        attrGrid.add (new UILabel({'text': text}));
        index++;
      }
    }

    attrGrid.add (new UIButton({'title': 'View logs',
                                'image': '/pics/buttons/text.gif',
                                'click': function (node) { return function () {
                                           browseLogs (node);
                                         };
                                       } (node)}));
    attrGrid.setCellStyle(index, 0, {'colspan': 2});
    attrGrid.setRows(index + 1);

    box.add(attrGrid);

    return box;
  }

  function isNodeBoxCollapsed(node) {
    var collapsed = true;
    $(['#nodesList']).each(function() {
      var boxHolder = $('' + this)[0].childNodes[0];

      if (boxHolder) {
        var p = boxHolder.uiWidget;
        var box = p.lookupWidget ('nodeBox_' + node.uuid);
        if(box && !box.getCollapsed ())
          collapsed = false;
      }
    });

    return collapsed;
  };

  function createNodesDom(where, data, collapsed) {
    if (!data.length) {
      where.parent().css('padding', '0');
      where.empty();
      return;
    } else {
      where.parent().css('padding', '');
    }

    var grid = new UIGrid({'padding': 2,
                           'rows': data.length})

    for(var i = data.length - 1; i >= 0; i--) {
      var box = createNodeBox(data[i], isNodeBoxCollapsed(data[i]));
      grid.add(box);
    }

    where.empty();
    where.append(grid.build());
  };

  function reloadNodes() {
    var nodesList = $('#nodesList');

    if (nodesList.length) {
      $.getJSON('/ajax/get/nodes',
                function (data) {
                    createNodesDom($('#nodesList'), data);
                });
    }
  };

  function createNodes() {
    reloadNodes();
  };

  function createNodesButtons() {
    var nodesButtons = $('#nodesButtons');

    if (nodesButtons.length) {
      var grid = new UIGrid({"rows": 1,
                             "cols": 2,
                             "cellStyles": [[{"padding": [0, 2, 0, 0]}, {"padding": [0, 0, 0, 2]}]]});

      var reloadBtn = new UIButton({"title": "Reload nodes",
                                    'image': '/pics/buttons/refresh.gif',
                                    "click": reloadNodes});
      grid.add(reloadBtn);

      var registerBtn = new UIButton({"title": "View server log",
                                      'image': '/pics/buttons/text.gif',
                                      "click": function () {
                                            window.open('/logs/server.txt');
                                          }});
      grid.add(registerBtn);

      nodesButtons.append(grid.build());
    }
  };

  /* fill page with nodes information blocks */
  this.fillPage = function() {
    createNodes();
    createNodesButtons();
  };

  this.setEnabled = function (nodeUUID, enabled) {
      $.getJSON('/ajax/set/nodeEnabled?nodeUUID=' + escape(nodeUUID) + '&enabled=' + (enabled ? 1 : 0),
                function (data) {});
  };
};
