/*!
 * bfarm renderfarm 0.1pre web interface
 *
 * Copyright 2010, Sergey Sharybin
 * Licensed under the GPL Version 2 license.
 *
 */

var jobs = new function () {
  var attrs = [{'title': 'Identifier', 'field': 'uuid'},
               {'title': 'Type', 'field': 'type'},
               {'title': 'File', 'field': 'fname'}];

  var TYPE_ANIM = 0;
  var TYPE_STILL = 1;

  function browseRenders(job) {
    window.open('/renders/job-' + job['uuid']);
  };

  function createJobBox(job) {
    /* XXX: replace with form template */
    var box = new UICollapseBox({'title': job.title,
                                 'collapsed': true,
                                 'animated': true});

    var grid = new UIGrid({'cols': 2,
                           'rows': attrs.length + 1,
                           'padding': 2});
    grid.setCellStyle(0, 0, {'width': 70});
    grid.setCellStyle(attrs.length, 0, {'colspan': 2});

    for(var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      grid.add (new UILabel({'text': attr['title']}));
      grid.add (new UILabel({'text': job[attr['field']]}));
    }

    grid.add (new UIButton({'title': 'Browse render files',
                            'image': '/pics/buttons/browse.gif',
                            'click': function (job) { return function () {
                                           browseRenders (job);
                                         };
                                       } (job)}));

    box.add(grid);

    return box;
  };

  function createJobsDom(where, title, data) {
    where.empty();

    if (!data.length) {
      where.parent().css('padding', '0');
      return;
    } else {
      where.parent().css('padding', '');
    }

    var jobsGroup = new UIGroupBox({'title': title});
    var grid = new UIGrid({'padding': 2,
                           'rows': data.length})

    for(var i = 0; i < data.length; i++) {
      var box = createJobBox(data[i]);
      grid.add(box);
    }

    jobsGroup.add(grid);
    where.append(jobsGroup.build());
  };

  function reloadJobs() {
    var jobsList = $('#jobsList');

    if (jobsList.length) {
      $.getJSON('/ajax/get/jobs',
                function (data) {
                    createJobsDom($('#jobsList'), 'Running jobs', data);
                });
    }
  };

  function reloadCompletedJobs() {
    var completedJobsList = $('#completedJobsList');

    if (completedJobsList.length) {
      $.getJSON('/ajax/get/completedJobs',
                function (data) {
                    createJobsDom($('#completedJobsList'), 'Completed jobs', data);
                });
    }
  };

  function reloadAllJobs() {
    reloadJobs ();
    reloadCompletedJobs ();
  };

  function createJobs() {
    reloadAllJobs();
  };

  function createJobButtons() {
    var jobsReload = $('#jobsButtons');
    if (jobsReload.length) {
      var grid = new UIGrid({"rows": 1,
                             "cols": 2,
                             "cellStyles": [[{"padding": [0, 2, 0, 0]}, {"padding": [0, 0, 0, 2]}]]});

      var reloadBtn = new UIButton({"title": "Reload jobs",
                                    'image': '/pics/buttons/refresh.gif',
                                    "click": reloadAllJobs});
      grid.add(reloadBtn);

      var registerBtn = new UIButton({"title": "Register job",
                                      'image': '/pics/buttons/add.gif',
                                      "click": jobs.register.show});
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
                              'height': 280,
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
};
