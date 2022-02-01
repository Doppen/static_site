const fs = require('fs');
var elasticlunr = require('../src/js/elasticlunr.min.js');
let siteContentArr = [];
const sitedata = require("../data/site.json");
var stopwords = require('../app/stopwoorden.json');

let i = 0;

addPagetoIndex(i);


function addPagetoIndex(i) {
  if ((i+1) == sitedata.length) { // if all items in array are past then write indexfile
    lunr()
    //createFile('siteIndex.json', JSON.stringify(siteContent));
  } else {
    // get item data
    item = sitedata[i];
    let indexObject = {};
    let file = 'src/components/'+item.markdown_file+'.html'

    //read the md file and strip the tags
    fs.readFile(file , 'utf-8', function(error, source) {
      //console.log(source);
      let fileContent = source;
      const strippedString = fileContent.replace(/(<([^>]+)>)/gi, "");

      // create index object
      indexObject.id= i;
      indexObject.title=item.title;
      indexObject.body=strippedString;
      indexObject.ref=item.file_name;

      siteContentArr.push(indexObject);
      // go to the next
      addPagetoIndex(i+1)

    });
  }
}


function lunr() {

  // dutch stopwords
  //elasticlunr.clearStopWords();
  //var customized_stop_words = stopwords;
  elasticlunr.addStopWords();


  var idx = elasticlunr(function () {
    this.setRef('id');
    this.addField('title');
    this.addField('body');
  });

  var siteContent = siteContentArr.map(function (q) {
    return {
      id: q.id,
      title: q.title,
      body: q.body,
      ref: q.ref
    };
  });

  siteContent.forEach(function (siteContent) {
    idx.addDoc(siteContent);
  });

  createFile('./src/js/search_index.js', "var indexDump = "+JSON.stringify(idx));


}





function createFile(fileName, content) {
  fs.writeFile(fileName, content, function(err) {
    if (err) throw err;
  });
}
