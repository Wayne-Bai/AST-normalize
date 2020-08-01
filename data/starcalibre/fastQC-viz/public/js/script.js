/* MULTIPLE FILE UPLOADER */

var fileArray = [];
var fastQCObjects = [];

$('#file-selector').change(function() {
  fastQCObjects = [];
  for(var i = 0; i < this.files.length; i++) {
    fileArray.push(this.files[i]);
  }
  createTable(fileArray);
});

function createTable(fileArray) {
  $('#file-table').empty();

  // create headers
  $('#file-table').append('<tbody></tbody>');
  $('#file-table').find('tbody:last').append('<th>File Name</th> ' +
  '<th>Size</th> <th></th>');

  //create rows
  for(var i = 0; i < fileArray.length; i++) {
    $('#file-table').find('tbody:last').append('<tr><td>' +
    fileArray[i]['name'] +'</td><td>' + bytesToKb(fileArray[0]['size']) + '</td>' +
    '<td><button type="button" ' + 'class="btn btn-danger remove-button">' +
    'Remove</button></td></tr>');
  }

  //append listener for removal button
  $('#file-table .remove-button').on("click",function() {
    var tr = $(this).closest('tr');
    var index = tr[0].rowIndex;
    tr.fadeOut(400, function(){
      tr.remove();
    });
    // remove entry from files variable
    fileArray.splice(index, 1);

    // remove whole table if final row removed
    if (fileArray.length === 0) {
      $('#file-table').empty()
    }
    return false;
  });
};

function bytesToKb(bytes) {
  var kb = (bytes/1024).toFixed(2);
  return kb.toString() + 'KB';
}

$('#reset-button').on('click', function() {
  fileArray = [];
  fastQCObjects = [];
  $('#file-table').empty();
});

$('#submit-button').on('click', function() {
  if(fileArray.length === 0) {
    alert('There\'s no files to submit! :C');
  }
  else {
    for(var i = 0; i < fileArray.length; i++) {
      (function(file) {
        var reader = new FileReader();
        reader.onload = function(event) {
          var text = event.target.result;
          var fastQC = new FastQCParser(text);
          fastQC.parseQC();
          fastQCObjects.push(fastQC);
        };
        reader.readAsText(file, "UTF-8");
      })(fileArray[i]);
    }
    window.setTimeout(function() {
      console.log(fastQCObjects[0].modules.basic);
      linePlot.render(fastQCObjects[0].modules.qual.quintiles);
      boxPlot.render(fastQCObjects[0].modules.qual.quintiles);
      insertBasicTable(fastQCObjects[0].modules.basic, 'basic-stats-table');
    }, 50);
  }
});

/* SETUP PLOTS */

var linePlot = new LinePlot()
  .bindTo('#line-plot')
  .width(600)
  .height(400);

var boxPlot = new BoxPlot()
  .bindTo('#box-plot')
  .width(600)
  .height(400);

/* SETUP BASIC TABLE TABLE */

function insertBasicTable(basic_data, insert_id) {
  /* Insert the key/value pairs into a table element on the DOM.

  basic_data = object containing key/value pairs
  insert_id  = the id on the DOM to insert the table into 
  
  Intentionally not including closing tags in the jquery requests;
  http://stackoverflow.com/a/14737115/2355035 */

  table_id = '#' + insert_id;
  var array_length = Object.keys(basic_data).length;
  var array_obj_names = Object.keys(basic_data);

  // create the table header
  $(table_id).empty();
  $(table_id).append('<thead>');
  $(table_id).append('<tr>')
  $(table_id).find('thead:last').append('<th>Tag');
  $(table_id).find('thead:last').append('<th>Data');

  // begin the table body and iterate through key/value pairs
  $(table_id).append('<tbody>');
  for (var i = 0; i < array_length; i++) {
    var attr_name = array_obj_names[i];
    var tag       = '<td>' + array_obj_names[i];
    var data      = '<td>' + basic_data[attr_name];

    $(table_id).find('tbody:last').append('<tr>' + tag + data);
  }
}


