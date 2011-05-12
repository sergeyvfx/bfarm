/*
 * bfarm renderfarm 0.1pre web interface
 *
 * Copyright 2010, Sergey Sharybin
 * Licensed under the GPL Version 2 license.
 */

var jobs = new function () {
  var attrs = [{'title': 'Identifier', 'field': 'uuid'},
               {'title': 'Registration time', 'field': 'start_time', 'filter': function (unixtime) { return new Date(parseInt(unixtime)*1000);}},
               {'title': 'Finish time', 'field': 'finish_time', 'filter': function (unixtime) { return new Date(parseInt(unixtime)*1000);}},
               {'title': 'File', 'field': 'fname', 'filter': fnameFilter},
               {'title': 'Type', 'field': 'type'},
               {'title': 'Start frame', 'field': 'start_frame'},
               {'title': 'End frame', 'field': 'end_frame'},
               {'title': 'Fie format', 'field': 'file_format'},
               {'title': 'X-resolution', 'field': 'resol_x'},
               {'title': 'Y-resolution', 'field': 'resol_y'},
               {'title': 'Percentage', 'field': 'percentage'},
               {'title': 'Total tasks', 'field': 'ntasks'},
               {'title': 'Completed tasks', 'field': 'progress'}];

  var priorities = [{'title': 'Suspended', 'tag': -99, 'toString': 'field:title'},
                    {'title': 'Low',       'tag':  -1, 'toString': 'field:title'},
                    {'title': 'Normal',    'tag':   0, 'toString': 'field:title'},
                    {'title': 'High',      'tag':   1, 'toString': 'field:title'}];

  var TYPE_ANIM = 0;
  var TYPE_STILL = 1;

  function fnameFilter(fname) {
    if(fname.match(/^svn\:\/\//)) {
      var s = fname.replace(/^svn\:\/\//, '');
      var parts = s.split(':');
      var repo = '';
      var file = '';
      var commit = '';

      for(var i = 0; i < parts.length-1; i++) {
        if (repo != '')
          repo += '/';

        repo += parts[i];
      }

      parts = parts[parts.length - 1].split('@');
      for(var i = 0; i < parts.length-1; i++) {
        if (file != '')
          file += '/';

        file += parts[i];
      }
      commit = parts[parts.length - 1];

      return 'SVN repo: ' + repo + '; file: ' + file + '; revision: ' + commit;
    }

    return fname;
  };

  function browseRenders(job) {
    window.open('/renders/job-' + job['uuid']);
  };

  function jobPriorityIndex(job) {
    for (var i = 0; i < priorities.length; i++) {
      if (priorities[i].tag == job.priority) {
        return i;
      }
    }

    return -1;
  };

  function statTime(val) {
    val = Math.ceil(val);

    var h = Math.floor(val / 60 / 60);
    var m = Math.floor(val / 60) % 60;
    var s = val % 60;

    return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };

  function createJobBoxHeaderItems(job) {
    var headerItems = [];

    if(job.progress == job.ntasks) {
      headerItems.push(new UILabel({'text': 'Completed',
                                    'color': '#007f00',
                                    'bold': true}));
      var headerItem = $('<DIV>') . css('height', '18px');
      headerItems.push(headerItem[0]);
    } else {
      var position = job.progress / job.ntasks;

      headerItems.push(new UILabel({'text': 'In progress',
                                    'color': '#7f0000',
                                    'bold': true}));
      headerItems.push(new UIProgress({'position': position,
                                       'height': 12,
                                       'width': 160}));

      var priorityCb = new UIComboBox({'title': 'Priority',
                                       'items': priorities,
                                       'active': jobPriorityIndex(job),
                                       'width': 150});
      priorityCb.onItemSelected = function (job) { return function (item) { jobs.setPriority (job.uuid, item.tag); } } (job);
      headerItems.push(priorityCb);
    }

    /* Different statistics */
    var stat = '';
    if (!isUnknown(job['task_time_max'])) stat += 'Max: ' + statTime(job['task_time_max']);
    else stat += 'Max: N/A';

    if (!isUnknown(job['task_time_avg'])) stat += ', Avg: ' + statTime(job['task_time_avg']);
    else stat += ', Avg: N/A';

    var statLabel = new UILabel({'text': stat})
    headerItems.push(statLabel);

    return headerItems;
  };

  function createJobBox(job, collapsed) {
    /* XXX: replace with form template */

    var position = job.progress / job.ntasks;
    var headerItems = createJobBoxHeaderItems(job);

    var box = new UICollapseBox({'title': job.title,
                                 'titleWidth': '30%',
                                 'collapsed': collapsed,
                                 'animated': true,
                                 'name': 'jobBox_' + job.uuid,
                                 'headerItems': headerItems});

    var grid = new UIGrid({'cols': 2,
                           'rows': 2,
                           'padding': 2});

    grid.setCellStyle(0, 0, {'valign': 'top'});
    grid.setCellStyle(0, 1, {'valign': 'top'});
    grid.setCellStyle(1, 0, {'colspan': 2});

    var attrGrid = new UIGrid({'cols': 2,
                               'padding': 2});
    attrGrid.setCellStyle(0, 0, {'width': 120});

    var index = 0;
    for(var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      var text = job[attr['field']];

      if (isUnknown(text))
        continue;

      if (attr['filter'])
        text = attr['filter'] (text);

      attrGrid.add (new UILabel({'text': attr['title']}));
      attrGrid.add (new UILabel({'text': text}));
      index++;
    }

    attrGrid.setCellStyle(index, 0, {'colspan': 2});
    attrGrid.add (new UIProgress({'position': position,
                                  'title': 'Progress'}));

    attrGrid.setRows(index + 1);

    grid.add (attrGrid);

    var frameGrid = new UIGrid({'cells': 1, 'rows': 2, 'padding': [0, 0, 2, 18]});
    var lastFrame = null;
    if(job['last_frame'])
      lastFrame = '/renders/job-' + job['uuid'] + '/' + job['last_frame'] + '?thumbnail=1';

    if (lastFrame) {
      frameGrid.add (new UILabel({'text': 'Last rendered frame:'}));
      frameGrid.add (new UIImage({'image': lastFrame}));
    }

    grid.add (frameGrid);

    grid.add (new UIButton({'title': 'Browse render files',
                            'image': '/pics/buttons/browse.gif',
                            'click': function (job) { return function () {
                                           browseRenders (job);
                                         };
                                       } (job)}));

    box.add(grid);

    return box;
  };

  function isJobBoxCollapsed(job) {
    var collapsed = true;
    $(['#jobsList']).each(function() {
      var boxHolder = $('' + this)[0].childNodes[0];

      if (boxHolder) {
        var p = boxHolder.uiWidget;
        var box = p.lookupWidget ('jobBox_' + job.uuid);
        if(box && !box.getCollapsed ())
          collapsed = false;
      }
    });

    return collapsed;
  };

  function createJobsDom(where, data, collapsed) {
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
      var box = createJobBox(data[i], isJobBoxCollapsed(data[i]));
      grid.add(box);
    }

    where.empty();
    where.append(grid.build());
  };

  function reloadJobs() {
    var jobsList = $('#jobsList');

    if (jobsList.length) {
      $.getJSON('/ajax/get/jobs',
                function (data) {
                    createJobsDom($('#jobsList'), data);
                });
    }
  };

  function createJobs() {
    reloadJobs ();
  };

  function createJobButtons() {
    var jobsReload = $('#jobsButtons');
    if (jobsReload.length) {
      var grid = new UIGrid({"rows": 1,
                             "cols": 2,
                             "cellStyles": [[{"padding": [0, 2, 0, 0]}, {"padding": [0, 0, 0, 2]}]]});

      var reloadBtn = new UIButton({"title": "Reload jobs",
                                    'image': '/pics/buttons/refresh.gif',
                                    "click": reloadJobs});
      grid.add(reloadBtn);

      var registerBtn = new UIButton({"title": "Register job",
                                      'image': '/pics/buttons/add.gif',
                                      "click": function () {
                                            window.setTimeout (jobs.register.show, 10);
                                          }});
      grid.add(registerBtn);

      jobsReload.append(grid.build());
    }
  };

  /* fill page with jobs information blocks */
  this.fillPage = function() {
    createJobs();
    createJobButtons();
  };

  this.register = new function() {
    this.show = function () {
      if (jobs.registerWnd)
        return;

      var wnd = new UIWindow({'title': 'Register job',
                              'name': 'registerJobWnd',
                              'width': 550,
                              'height': 324,
                              'modal': true,
                              'position': 'center',
                              'resizable': false,
                              'buttons': ['CLOSE']});
      wnd.onClose = function() { jobs.registerWnd = null; };

      var form = uiCreator.create('url://src/forms/jobsRegisterForm.js');
      wnd.add(form);
      wnd.show();

      jobs.registerWnd = wnd;
    };

    this.hide = function () {
      if (jobs.registerWnd) {
        jobs.registerWnd.close ();
        jobs.registerWnd = null;
      }
    };

    this.onSourceChanged = function (widget, userData, attrs) {
      var p = widget;
      var source = attrs[0];

      while (p && p.getName() != 'registerJobWnd') {
        p = p.parent;
      }

      if (p) {
        var fileSettingsPanel = p.lookupWidget ('fileSettingsPanel');
        var svnSettingsPanel = p.lookupWidget ('svnSettingsPanel');

        switch(source) {
          case 'FILE':
            fileSettingsPanel.setVisible(true);
            svnSettingsPanel.setVisible(false);
            break;
          case 'SVN':
            fileSettingsPanel.setVisible(false);
            svnSettingsPanel.setVisible(true);
            break;
        }
      }
    };

    this.onTypeChanged = function (widget, userData, attrs) {
      var p = widget;

      while (p && p.getName() != 'registerJobWnd') {
        p = p.parent;
      }

      if(p) {
        var animSettingsPanel = p.lookupWidget ('animSettingsPanel');
        var stillSettingsPanel = p.lookupWidget ('stillSettingsPanel');
        var index = widget.getActiveIndex();

        switch(index) {
          case TYPE_ANIM:
            animSettingsPanel.setVisible(true);
            stillSettingsPanel.setVisible(false);
            break;
          case TYPE_STILL:
            animSettingsPanel.setVisible(false);
            stillSettingsPanel.setVisible(true);
            break;
        }
      }
    };

    this.submit = function(widget) {
      var cur = widget.dom;
      var form = $('#jobRegister')[0];

      if (form) {
        form.submit();
      }
    };
  };

  this.setPriority = function (jobUUID, priority) {
      $.getJSON('/ajax/set/jobPriority?jobUUID=' + escape(jobUUID) + '&priority=' + priority,
                function (data) {});
  };
};
