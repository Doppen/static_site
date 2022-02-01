
var searchField = document.getElementById("searchTerm").value;

// highlight the search word
// document.addEventListener("DOMContentLoaded", function(){
//   var q = getUrlParameter('s');
//   if (q != '') {
//     var theContent = document.getElementById('theContent').innerHTML;
//     const regex = new RegExp(q, 'g');
//     theNewContent = theContent.replace(regex, '<span class="mgHighlight">'+q+'</span>');
//     document.getElementById('theContent').innerHTML = theNewContent;
//   }
//
//     console.log(q);
// });


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


function getResultsData() {
  let results = index.search(searchField);

  var resultList='';
  var arrayLength = results.length;

  var part = 0;
  for (var i = 0; i < arrayLength; i++) {
    if (results[i].doc.part != part) {
      //resultList+= '<div><strong>Deel '+results[i].doc.part+'</strong></div>'

    }
    resultList += '<div class="resultItem"><a href="'+results[i].doc.ref+'?s='+searchField+'">'+results[i].doc.title+'</a></div>';
    part = results[i].doc.part ;
  }
  return resultList;

}

function ShowResults() {

  searchField = document.getElementById("searchTerm").value;
  var output = 'Gezocht op "<em>' + searchField+'</em>"';

  output = output+'<br><br>'+getResultsData()

  document.getElementById('results').innerHTML = output;
}
