/*
 * bfarm renderfarm 0.1pre web interface
 *
 * Copyright 2010, Sergey Sharybin
 * Licensed under the GPL Version 2 license.
 */

var pages = {'jobs': {'fillPage': 'jobs.fillPage',
                      'template': 'jobs.html'},
             'nodes': {'fillPage': 'nodes.fillPage',
                       'template': 'nodes.html'}};

var startPage = 'jobs';

function setPagesSwitcher() {
  var switchers = $('.nav .navPageSwitcher A');
  switchers.click(function () {
      var name = this.parentNode.id.replace(/^page_/, '');
      showPage(name);
    });
}

function showPage(name) {
    var page = pages[name];

    $.get('/templates/' + page['template'], function(data) {
        $('.mainHolder').html(data);

       $('.nav .navPageSwitcher').removeClass('act');
       $('#page_' + name).addClass('act');
       uiUtil.findHandler (page['fillPage']) ();
    });
}

function main() {
  var loc = String(document.location);

  if (loc.indexOf('#') >= 0) {
    startPage = loc.replace(/^.*?#([A-z]*)/, '$1');
  }

  setPagesSwitcher();
  showPage(startPage);
}

$(document).ready(main)
