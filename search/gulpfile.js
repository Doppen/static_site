// npm i
// npm audit fix --force

// npm install -g google-spreadsheet-to-json

// node getj.js                    update all json files
// gulp nav                     update page navigation (new titles)
// gulp BuildIndexFromHTML      update the search index
// gulp convHtml
// node img

// gulp BuildIndexFromHTML      update the search index
// gulp buildSearchIndex

// gsjson 1k2EgdCT3iSo_8hGwt_dOQvKwEpBcTIFe4wefljkrb5Q >> content/data.json -b

var gulp = require('gulp');
var sass = require('gulp-sass');
var sass = require('gulp-sass')(require('node-sass'))
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var handlebars = require('gulp-compile-handlebars');
var useref = require('gulp-useref');
var replace = require('gulp-replace');
//var exec = require('child_process').exec;
var each = require('gulp-each');
var dom  = require('gulp-dom');
var mammoth = require("mammoth");
var writeFile = require('write-file');
var DomParser = require('dom-parser');

var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
const using = require('gulp-using');

var options = {
    batch : ['./src/components', './content/html/']
    }


var optionsWord = {
    styleMap: [
        "p[style-name='tabelKop'] => span.tabelKop",
        "p[style-name='tabelNummers'] => span.tabelNummers"
    ]
};


var dst =       '_dist/';
var prebuild =  'prebuild';
var fScss=      'src/scss/**/*.scss';
var fHtml=      'src/**/*.html';
var fHtmlNot=   '!src/components/nav.html';
var fImages=    ['src/images/**/*', '!src/images/oud/**/*'];
var fJs=        'src/js/**/*';
var fJson=      ['src/**/*.json', 'content/**/*.json'];
var fMd=        'content/**/*.md';
var allImgStr = 'not working';


var chapterId;



var siteJson = require('./content/data/sites.json');
var copyPath = require('./content/data/copyPath.json');
var stopwords = require('./content/data/stopwoorden.json');


// Create HTML
function createHtml(fileName) {
  mammoth.convertToHtml({path: copyPath.copyDestination+fileName+".docx", outputDir: "content/html/"}, optionsWord)
      .then(function(result){
          htmlOut = result.value; // The generated HTML
          messages = result.messages; // Any messages, such as warnings during conversion
          //console.log(htmlOut);
          fs.writeFileSync('content/html/'+fileName+'.html', htmlOut)
      })
}

function createRawtext(fileName) {
  mammoth.extractRawText({path: copyPath.copyDestination+fileName+".docx", outputDir: "content/rawTxt/"})
      .then(function(result){
        htmlOut = result.value; // The generated HTML
        messages = result.messages; // Any messages, such as warnings during conversion
        //console.log(htmlOut);
        fs.writeFileSync('content/html/raw_'+fileName+'.html', htmlOut)
      })

}


// gulp convHtml
gulp.task('convHtml', function (done) {
  var htmlOut='qqq';
  var messages;
  fs = require('fs');

  for(var ii=0; ii<siteJson.length; ii++) {
      page = siteJson[ii];
      fileName = page.content;
      createHtml(fileName);
      createRawtext(fileName);
      }
done();
});






gulp.task('browserSync', function() {
  browserSync.init({
    //proxy: "http://localhost:8888/wp-huc"
    server: {
      baseDir: dst
    },
    browser: ["firefox"], //, "firefox"
  })
})

function reload(done) {
  browserSync.reload();
  done();
}


// clear Json files en get new data from google docs
gulp.task('cleanJson', function () {
    return gulp.src(['content/data/links.json', 'content/data/sites.json', 'content/data/notes.json', 'content/data/images.json'], {read: false, allowEmpty: true})
        .pipe(plumber())
        .pipe(clean())
});

// gulp.task('getJSite', function (cb) {
//   exec('gsjson 1YAFTCWGrWyPjclnV16mR-S0-H2531DpOTfjCdESFSRk >> content/data/sites.json -b', function (err, stdout, stderr) { cb(err); });
// })
//
// gulp.task('getJLinks', function (cb) {
//   exec('gsjson 1tzMeyKmoFMGbehWd1Q0hWbTceVf6IajMGX4r3NUqLA8 >> content/data/links.json -b', function (err, stdout, stderr) { cb(err); });
// })
//
// gulp.task('getJNotes', function (cb) {
//   exec('gsjson 1Rh6CIMnB9Vs4ot21nZqFSQDMraWf4RLaoXpAM4JvFI4 >> content/data/notes.json -b', function (err, stdout, stderr) { cb(err); });
// })
//
// gulp.task('getJImages', function (cb) {
// exec('gsjson 15B_aMTtiGuokP1KP6Iu09RNr4X3ZZQyO-Qp1dq8eg7I >> content/data/images.json -b', function (err, stdout, stderr) { cb(err); });
// })
//
// gulp.task('getj', gulp.series('cleanJson', 'getJSite', 'getJLinks', 'getJNotes', 'getJImages',  function (done) {
//   done();
// }))

// gulp getj
// links  1tzMeyKmoFMGbehWd1Q0hWbTceVf6IajMGX4r3NUqLA8
// notes  1U2daUDRZfhFHcrVujJxNcqFejs2Ui58zBSi8ThlMw50
// notes  1Rh6CIMnB9Vs4ot21nZqFSQDMraWf4RLaoXpAM4JvFI4  // only longnotes
// site   1YAFTCWGrWyPjclnV16mR-S0-H2531DpOTfjCdESFSRk
// images 15B_aMTtiGuokP1KP6Iu09RNr4X3ZZQyO-Qp1dq8eg7I

// npm mammoth d1h1.docx output.html


gulp.task('clean', function () {
    return gulp.src(dst, {read: false, allowEmpty: true})
        .pipe(plumber())
        .pipe(clean())
});


// create navigation
gulp.task('nav', function(done) {
  var navItems = {"items" : siteJson}

  gulp.src(['./src/templates/nav.html', './src/templates/homeContentList.html'])
      .pipe(plumber())
      .pipe(handlebars(navItems, options))
      .pipe(gulp.dest('src/components/'));
  done();
});


// create index json root file
gulp.task('BuildIndexFromHTML', function(done) {
  var indexItems = {"items" : siteJson}

  console.log(indexItems );

  gulp.src('./src/templates/createIndexJson.html')
      .pipe(plumber())
      .pipe(handlebars(indexItems, options))
      //.pipe(rename('test.html'))
      .pipe(rename(function (path) {
        path.basename = "example_data";
        path.extname = ".json";
        }))
        //.pipe(replace('"', '\\"'))
        .pipe(replace('"', ''))
        .pipe(replace(/(?:\r\n|\r|\n)/g, ''))
        .pipe(replace('^^^', '"'))
      .pipe(gulp.dest('./'));
  done();
});


gulp.task('sass', function(){
  return gulp.src('./src/scss/*')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(dst+'css'))
});




//var linksJson = require('./content/data/links.json');
var notesJson = require('./content/data/notes.json');
var imagesJson = require('./content/data/images.json');

gulp.task('buildFromTemplates', function(done) {
  var page;
  var fileName;
  var template;
  var messages;
  var pageId;

  for(var i=0; i<siteJson.length; i++) {
      page = siteJson[i];
      fileName = page.name; //.replace(/ +/g, '-').toLowerCase();
      template = page.template;
      pageId = page.id;

      gulp.src('./src/templates/'+template+'.html')
          .pipe(plumber())
          .pipe(handlebars(page, options))
          .pipe(rename(fileName + ".html"))
          .pipe(replace('±', '<br>'))
          .pipe(replace('">[', '">'))
          .pipe(replace('<a id="_Hlk61816812"></a>', ''))
          .pipe(replace('<h3><a id="_Hlk496267545"></a></h3>', ''))
          .pipe(replace(']</a>', '</a>'))
          .pipe(replace('<sup>*</sup>', '<span class="astrixNote">*</span>'))
          .pipe(replace('<sup>* </sup>', '<span class="astrixNote">*</span>'))
          .pipe(replace('m<sup>3</sup>', 'm&#179;'))
          .pipe(replace('m<sup>2 </sup>', 'm&#178;'))
          .pipe(replace('m<sup>2  </sup>', 'm&#178;'))
          .pipe(replace('<sup> <sup>', '<sup>'))
          .pipe(replace('<sup><sup>', '<sup>'))
          .pipe(replace('</sup></sup>', '</sup>'))
          .pipe(replace('<sup> </sup>', ' '))
          .pipe(replace('<sup>', '&nbsp;<span class="noot">'))
          .pipe(replace('</sup>', '</span>'))
          .pipe(replace('@i@', '<div class="inlineImgRow">'))
          .pipe(replace('@/i@', '</div>'))
          .pipe(replace('@q@', '<div class="quote">'))
          .pipe(replace('@/q@', '</div>'))
          .pipe(replace('@H@&lt;', ''))
          .pipe(replace('&gt;@/h@', ''))
          .pipe(replace('@/h@', ''))
          .pipe(replace('33_NRCDienstregeling', '33_NRCDienstverlening'))
          .pipe(replace('<ol><li id="endnote-1">', '<div class="notesList"><h2>Noten</h2><ol><li id="endnote-1">'))
          .pipe(replace('<td colspan="2"><p><strong>Sleepboten</strong></p></td>', '<td colspan="2" style="text-align: center;"><p><strong>Sleepboten</strong></p></td>'))
          .pipe(replace('<td><p>NoordHollands Kanaal</p></td>', '<td><p>Noord-Hollands Kanaal</p></td>'))
          .pipe(replace('<strong>Aandeel spoorwegvervoer(%)</strong>', '<strong>Aandeel spoorwegvervoer<br>(%)</strong>'))
          .pipe(replace('<strong>3b_Kaart_maritiem_01.jpg</strong>]]]', '3b_Kaart_maritiem_01.jpg]]]'))


          .pipe(each(function(content, file, callback) {
            var newContent = content;

            // Get the ID
            var d = new DomParser().parseFromString( newContent, "text/xml" );
            var id = d.getElementById("chaperId").innerHTML;  //chaperId
            var template = d.getElementById("chaperTemp").innerHTML;

            // replace the images
            newContent = handleImages(content, id);

            callback(null, newContent);
          }))
          .pipe(replace(',******', ''))
          .pipe(dom(function(){

            //remove <br> in title
            var title = this.getElementsByTagName("title")[0].innerHTML;
            this.getElementsByTagName("title")[0].innerHTML = title.replace('&lt;br&gt;',' ');

            // remove links in h2
            var h2 = this.getElementsByTagName("h2");
            for (var i = 0; i < h2.length; i++) {
              var firstA = h2[i].getElementsByTagName("a")[1];
              if(typeof firstA !== "undefined") {
                firstA.remove();
              }

              var firstA2 = h2[i].getElementsByTagName("a")[0];
              if(typeof firstA2 !== "undefined") {
                firstA2.remove();
              }

            }


            var chapterId = this.getElementById("chaperId").innerHTML;
            var chaperTemp = this.getElementById("chaperTemp").innerHTML;

            //handle the notes
            if ((chaperTemp == 'basic') || (chaperTemp == 'chapter')) {
              domContent = handleNotes(this, chapterId);
            }


        }))
          .pipe(useref())
          .pipe(gulp.dest(dst))
          .pipe(browserSync.stream());
  }
  done();
});


gulp.task('copyImg', function(){
  return gulp.src(fImages)
    .pipe(plumber())
    .pipe(gulp.dest(dst+'images'))
});

gulp.task('copyJs', function(){
  return gulp.src('src/js/elasticlunr.min.js')
      .pipe(plumber())
      .pipe(gulp.dest(dst+'js'))
});

gulp.task('copyJson', function(){
  return gulp.src('src/js/search_index.js')
      .pipe(plumber())
      .pipe(gulp.dest(dst+'js'))
});



gulp.task('buildSearchIndex', function (done) {
  var elasticlunr = require('./src/js/elasticlunr.min.js'),
      fs = require('fs');
  // require('./src/js/lunr.stemmer.support.js')(elasticlunr);
  // require('./src/js/lunr.du.js')(elasticlunr);

  var idx = elasticlunr(function () {
    //this.use(elasticlunr.du);

    this.setRef('id');
    this.addField('title');
    this.addField('tags');
    this.addField('body');
  });

  elasticlunr.clearStopWords();
  var customized_stop_words = stopwords;
  elasticlunr.addStopWords(customized_stop_words);


  fs.readFile('./example_data.json', function (err, data) {
    if (err) throw err;

    var raw = JSON.parse(data);
    //console.log(raw);

    var siteContent = raw.siteContent.map(function (q) {
      return {
        id: q.id,
        title: q.title,
        body: q.body,
        part: q.part,
        chapter: q.chapter,
        ref: q.ref
      };
    });

    siteContent.forEach(function (siteContent) {
      idx.addDoc(siteContent);
    });

    fs.writeFile('./src/js/search_index.js', "var indexDump = "+JSON.stringify(idx), function (err) {
      if (err) throw err;
      console.log('done');
    });
  });


done();
});





gulp.task('build',
  gulp.series('clean', 'nav', 'sass', 'buildFromTemplates', 'copyImg', 'copyJs', 'copyJson', //'buildSearchIndex',
  function(done) {
      done();
  }
));


gulp.task('watch', function () {
  gulp.watch(['src/**/*.html', '!src/components/nav.html', '!src/components/homeContentList.html', 'src/scss/**/*.scss','src/js/**/*', 'src/**/*.json', 'content/**/*.json'], gulp.series('build')); //, fHtmlNot, fScss, fJs, fJson, fMd
});



gulp.task('default',
  gulp.series('build', gulp.parallel('browserSync','watch'),
  function(done) {
      done();
  }

));


function ifEmp(input, pre, post) {
  let out = ''
  if( (input != undefined) ) {
    if (input != '') {
      out = pre+input+post;
    }
  }
  return out;

}


// image function.
function handleImages(newContent, id) {
  var output;
  for (var k = 0; k < imagesJson.length; k++) {


          // before [[[
          newContent = newContent.replace('[[['+imagesJson[k].filename, '<div class="inlineImage" id="'
          +imagesJson[k].filename+'"><span><img src="images/'+imagesJson[k].chapter+'/'+imagesJson[k].chapter+'-170/'+imagesJson[k].filename);

          //after ]]]
          newContent = newContent.replace(imagesJson[k].filename+']]]', imagesJson[k].filename+'" alt="'+
          ifEmp(imagesJson[k].title, '', '')+ifEmp(imagesJson[k].description, '. ', '')
          +'"></span>'
          +'<div class="caption">'
          +'<div class="captionTitle">'+ifEmp(imagesJson[k].title, '', '')+'</div>'
          +'<span class="openCaption">[i]</span>'
          +'<div class="moreCaption">'
          +ifEmp(imagesJson[k].description, '', '')
          +ifEmp(imagesJson[k].description2, '<br><span>', '</span>')
          +ifEmp(imagesJson[k].description3, '<br><span>', '</span>')
          +ifEmp(imagesJson[k].location, '<br>', '')
          +ifEmp(imagesJson[k].owner, '<br><em>', '</em>')
          +'</div></div></div>');

          // images array
          if (imagesJson[k].filename!= undefined) {
            //console.log(id +' = '+imagesJson[k].chapter);
            if (id == imagesJson[k].chapter) {
              newContent = newContent.replace('******', "'"+imagesJson[k].filename+"',******")
            }
          }
  }
  return newContent;
}


function handleNotes(domContent, chapterId) {

      for(var l=0; l<notesJson.length; l++) {
        //console.log(chapterId +' >> '+ notesJson[l].chapter);
        if (chapterId == notesJson[l].chapter) {
          var noteContent;

          // notes to long notes
          noteContent =  ifEmp(notesJson[l].long_note, '', '');
          noteContent  += ifEmp(notesJson[l].auteur1, '', ', ');
          noteContent  += ifEmp(notesJson[l].publicatie1, '<em>', '</em> ');
          noteContent  += ifEmp(notesJson[l].publicatie1extra, '<br>', '');
          noteContent  += ifEmp(notesJson[l].auteur2, '<br>', ', ');
          noteContent  += ifEmp(notesJson[l].publicatie2, '<em>', '</em> ');
          noteContent  += ifEmp(notesJson[l].publicatie2extra, '<br>', '');
          noteContent  += ifEmp(notesJson[l].extra, '<br>', '');
          noteContent  += ifEmp(notesJson[l].url, '<br><div class="ellipsis"><a target="_blank" href="'+notesJson[l].url+'">', '</a></div>');
          noteContent  += ifEmp(notesJson[l].viewdatumurl, '', '');
          noteContent  += ifEmp(notesJson[l].worldcat, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel2, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel3, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel4, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel5, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel6, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel7, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel8, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          noteContent  += ifEmp(notesJson[l].worldcattitel9, '<br><a href="', '" target="_blank">Zie worldcat.org</a>');
          //console.log(chapterId, 'endnote-'+notesJson[l].note_number);

          domContent.getElementById('endnote-'+notesJson[l].note_number).innerHTML = noteContent;
        }
      }
  return domContent;
}
