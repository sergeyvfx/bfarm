function fillJobsCb(data) {
  var jobsList = $('#jobsList');

  for(var i = 0; i < data.length; i++) {
    jobsList.find('tbody')
        .append($('<tr>')
                   .addClass(i % 2 ? 'l' : '')
                   .append($('<td>')
                            .text(data[i].uuid)
                          )
                   .append($('<td>')
                            .text(data[i].title)
                          )
                   .append($('<td>')
                            .text(data[i].type)
                          )
                   .append($('<td>')
                            .text(data[i].fname)
                          )
               )
  }
}

function main() {
  var jobsList = $('#jobsList');

  if (jobsList.length)
    $.getJSON('/ajax/get/jobs', fillJobsCb);
}

$(document).ready(main)
