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
    grid.setCellStyle(0, 0, {'width': 120});
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

  function createJobsDom(where, title, data, refresh_cb) {
    var jobsGroup = new UIGroupBox({'title': title});
    var grid = new UIGrid({'padding': 2,
                           'rows': data.length + 1})

    for(var i = 0; i < data.length; i++) {
      var box = createJobBox(data[i]);

      grid.add(box);
    }

    grid.add(new UIButton({'title': 'Refresh list',
                           'image': '/pics/buttons/refresh.gif',
                           'click': function () { window.setTimeout (refresh_cb, 10); }}));

    jobsGroup.add(grid);
    where.empty();
    where.append(jobsGroup.build());
  };

  function reloadJobs() {
    var jobsList = $('#jobsList');

    if (jobsList.length) {
      $.getJSON('/ajax/get/jobs',
                function (data) {
                    createJobsDom($('#jobsList'), 'Running jobs', data, reloadJobs);
                });
    }
  };

  function reloadCompletedJobs() {
    var completedJobsList = $('#completedJobsList');

    if (completedJobsList.length) {
      $.getJSON('/ajax/get/completedJobs',
                function (data) {
                    createJobsDom($('#completedJobsList'), 'Completed jobs', data, reloadCompletedJobs);
                });
    }
  };

  function createJobs() {
    reloadJobs ();
    reloadCompletedJobs ();
  };

  function createJobRegisterForm() {
    var jobRegister = $('#jobRegister');

    if (!jobRegister.length)
      return;

    form = uiCreator.create('url://src/forms/jobsRegisterForm.js');
    jobRegister.append(form.build());
  };

  /* fill page with jobs information blocks */
  this.fillPage = function() {
    createJobs();
    createJobRegisterForm();
  };

  this.register = new function() {
    this.onTypeChanged = function (widget, userData, attrs) {
      var p = widget;

      while (p && p.getName() != 'registerJobPanel')
        p = p.parent;

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
      var form = null;

      while (cur) {
        if (cur.tagName && cur.tagName.toLowerCase() == 'form') {
          form = cur;
          break;
        }

        cur = cur.parentNode;
      }

      if (form) {
        form.submit();
      }
    };
  };
};
