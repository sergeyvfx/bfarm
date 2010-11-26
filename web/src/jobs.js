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

  function createJobBox(job) {
    /* XXX: replace with form template */
    var box = new UICollapseBox({'title': job.title,
                                 'collapsed': true,
                                 'animated': true});

    var grid = new UIGrid({'cols': 2, 'rows': attrs.length});

    for(var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      grid.add (new UILabel({'text': attr['title']}));
      grid.add (new UILabel({'text': job[attr['field']]}));
    }

    box.add(grid);

    return box;
  };

  function createJobsCb(data) {
    var jobsList = $('#jobsList');
    var jobsGroup = new UIGroupBox({'title': 'Running jobs'});
    var grid = new UIGrid({'padding': 2,
                           'rows': data.length})

    for(var i = 0; i < data.length; i++) {
      var box = createJobBox(data[i]);

      grid.add(box);
    }

    jobsGroup.add(grid);
    jobsList.append(jobsGroup.build());
  };

  function createJobs() {
    var jobsList = $('#jobsList');

    if (jobsList.length) {
      $.getJSON('/ajax/get/jobs', createJobsCb);
    }
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
};
