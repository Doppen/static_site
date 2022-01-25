const handlebars = require("handlebars");
const fs = require("fs-extra");
const path = require("path");
let sass = require("sass");
let markdown = require("markdown").markdown;

const sitedata = require("../data/site.json");
const outputDir = "_dist/";
const outputVersion = 1;
const partialsDir = "./src/components";

build();

function build() {
  // clear output folder, then build site
  fs.remove(outputDir)
    .then(createFolder)
    //.then(markdown2Html)
    .then(registerPartials)
    //.then(createContentList)
    .then(generateNavigationList)
    .then(() => {
      createSite();
      fs.copySync("src/images/", outputDir + "images/");
      fs.copySync("src/js/", outputDir + "js/");
      //fs.copySync("data/", outputDir + "data/");
    })
    .catch((err) => {
      console.error(err);
    });
}

function createSite() {
  generateHtml();
  createSass("src/scss/style.scss");
  //createSass("src/scss/editor.scss");
}

// // convert markdown files to HTML components
// function markdown2Html() {
//   return new Promise((resolve, reject) => {
//     let fileAmount = 0
//     fs.readdir('markdown', (err, files) => {
//       fileAmount = files.length
//         files.forEach((file, i) => {
//             fs.readFile('markdown/'+file, 'utf-8', function(error, source){
//               let fileContent = source
//               fileContent = replace(fileContent, '§cc', '"> </span>')
//               fileContent = replace(fileContent, '§c', '<span class="clColorSample" style="background-color:')
//               fileContent = replace(fileContent, '{{>', '@@@@')
//               fileContent = markdown.toHTML(fileContent)
//               fileContent = replace(fileContent, '@@@@', '<div class="showComps"><div class="showComponents">{{>')
//               fileContent = replace(fileContent, '}}', '}}</div><div class="showComponentsCode"></div></div>')
//               fileContent = replace(fileContent, '&gt;', '>')
//               fileContent = replace(fileContent, '&lt;', '<')
//               fileContent = replace(fileContent, '&quot;', '"')
//               createFile(partialsDir+'/markdown/'+file, fileContent)
//               if (fileAmount == (i+1)) {
//                 resolve('markdown');
//               }
//             });
//           })
//         })
//     });

// function replace(str, orig, replacement) {
//   let find = '&gt;';
//   let rgx = new RegExp(orig, "g");
//   let out = str.replace(rgx, replacement);
//   return out
// }

// }

// register partials (components) and generate site files
function registerPartials() {
  return new Promise((resolve, reject) => {
    const longPath = path.resolve("./src/components/");
    var walk = function (dir, done) {
      var results = [];
      fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
          file = path.resolve(dir, file);
          fs.stat(file, function (err, stat) {
            // if dir
            if (stat && stat.isDirectory()) {
              walk(file, function (err, res) {
                results = results.concat(res);
                if (!--pending) done(null, results);
              });
            } else {
              results.push(file.replace(longPath + "/", ""));
              file = file.replace(longPath + "/", "");

              fs.readFile("src/components/" + file, "utf-8", function (
                error,
                source
              ) {
                handlebars.registerPartial(
                  file.replace(path.extname(file), ""),
                  source
                );
              });
              if (!--pending) done(null, results);
            }
          });
        });
      });
    };

    walk(partialsDir, function (err, results) {
      if (err) throw err;
      setTimeout(() => {
        resolve(results);
      }, 500);
    });
  });
}

// create sass file
function createSass(pathFile) {
  let filename = path.basename(pathFile).replace(path.extname(pathFile), "");
  sass.render(
    {
      file: pathFile,
      outputStyle: "compressed"
    },
    function (err, result) {
      if (err) {
        console.log("Sass error:" + err);
      } else {
        let filename = path
          .basename(pathFile)
          .replace(path.extname(pathFile), "");
        createFile(
          outputDir + "css/v" + outputVersion + "/" + filename + ".css",
          result.css.toString()
        );
      }
    }
  );
}

//prefab pages list on home
function createContentList() {
  let pages = []
  sitedata.forEach((item) => {
    pages.push(item);
  });
  pages.shift();
  sitedata[0].pagesList = pages;
}


function generateNavigationList() {
  let list = '';
  let pageLevel = 1
  sitedata.forEach((item, i) => {
    if (item.page_level > pageLevel ) {
      list+= '<li><ul>'
    }
    if (item.page_level < pageLevel ) {
      list+= '</ul></li>'
    }
    list+= '<li><a href="'+item.file_name+'">'+item.title+'</a></li>';

    pageLevel = item.page_level;
  });

  for (var i = 0; i < pageLevel-1; i++) {
    list+= '</ul></li>';
  }

  let out = '<ul>'+list+'</ul>'

  createFile('src/components/navigation.html', out)

}



// generate files
function generateHtml() {
  sitedata.forEach((item) => {
    fs.readFile("src/templates/" + item.template, "utf-8", function (
      error,
      source
    ) {
      var template = handlebars.compile(source);
      var html = template(item);
      createFile(outputDir + item.file_name, html);
      //console.log(item.file_name+' created.');
    });
  });
}

// create new files
function createFile(fileName, content) {
  fs.writeFile(fileName, content, function (err) {
    if (err) throw err;
  });
}

// create folders
function createFolder() {
  fs.mkdirSync(outputDir);
  fs.mkdirSync(outputDir + "/css");
  fs.mkdirSync(outputDir + "/css/v" + outputVersion + "/");
}
