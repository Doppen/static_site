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
    .then(addPageBreadCrumb)
    .then(addPageNavigationList)
    .then(addPageSubNavigationList)
    .then(createAltPageLists)
    .then(markdown2Html)
    .then(registerPartials)

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
function markdown2Html() {
  return new Promise((resolve, reject) => {
    let fileAmount = 0
    fs.readdir('markdown', (err, files) => {
      fileAmount = files.length
      files.forEach((file, i) => {
        fs.readFile('markdown/' + file, 'utf-8', function(error, source) {
          let fileContent = source
          fileContent = markdown.toHTML(fileContent)
          file = file.replace(".md", ".html");

          createFile(partialsDir + '/markdown/' + file, fileContent)
          if (fileAmount == (i + 1)) {
            resolve('markdown');
          }
        });
      })
    })
  });
}

// register partials (components) and generate site files
function registerPartials() {
  return new Promise((resolve, reject) => {
    const longPath = path.resolve("./src/components/");
    var walk = function(dir, done) {
      var results = [];
      fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
          file = path.resolve(dir, file);
          fs.stat(file, function(err, stat) {
            // if dir
            if (stat && stat.isDirectory()) {
              walk(file, function(err, res) {
                results = results.concat(res);
                if (!--pending) done(null, results);
              });
            } else {
              results.push(file.replace(longPath + "/", ""));
              file = file.replace(longPath + "/", "");

              fs.readFile("src/components/" + file, "utf-8", function(
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


    walk(partialsDir, function(err, results) {
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
  sass.render({
      file: pathFile,
      outputStyle: "compressed"
    },
    function(err, result) {
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






function addPageBreadCrumb() {
  let parentPageName = '';
  let parentPageLink = '';
  let parentPageLevel = 1;

  sitedata.forEach((page, i) => {
    let breadCrumb = '';
    let currPage = '<span>' + page.title + '</span>'

    if (page.page_level == 1) {
      // if top level
      breadCrumb = currPage;
      parentPageName = page.title
      parentPageLink = page.file_name

    } else if (page.page_level = 2) {
      // if subpage
      breadCrumb = '<a href="' + parentPageLink + '">' + parentPageName + '</a> ' + currPage;
    }
    sitedata[i].breadcrumb = breadCrumb;
  });
}



// create
function addPageNavigationList() {
  sitedata.forEach((page, i) => {
    // each page
    if (page.type == 'page') {

      // navigation list
      let list = '';
      let pageLevel = 1

      sitedata.forEach((item, j, sitedata) => {
        let currClass = '';
        let genId = uniqueGenerator();
        if (i == j) {
          currClass = ' class="currPage"';
        }
        // if start sublevel
        if (item.page_level > pageLevel) {
          //list+= '<button onclick="subNav(\''+genId+'\')">></button>'
          list += '<ul id="' + genId + '">'
        }
        // if end sublevel
        if (item.page_level < pageLevel) {
          list += '</ul></li>'
        }
        // display link and name
        list += '<li' + currClass + '><a href="' + item.file_name + '">' + item.title + '</a>';

        if (!Object.is(sitedata.length - 1, j)) {
          if (sitedata[j + 1].page_level == pageLevel) {
            list += '</li>';
          }
        }

        pageLevel = item.page_level;
      });

      for (var k = 0; k < pageLevel - 1; k++) {
        list += '</ul></li>';
      }

      let nav = '<ul>' + list + '</ul>';
      sitedata[i].navigation_list = nav;

    }
  });
}


function addPageSubNavigationList() {
  let tempArr = [];
  let tempUl = '';

  sitedata.slice().reverse().forEach((page, i) => {
    if (page.type == 'page') {

      if (page.page_level == 2) {
        tempUl = '<li><a href="' + page.file_name + '">' + page.title + '</a></li>' + tempUl;
        tempArr.push(sitedata.length - i)

      }
      if (page.page_level == 1) {
        tempArr.push((sitedata.length - i));
        tempArr.forEach((id, j) => {
          let tempUl2

          tempUl2 = tempUl.replace('<li><a href="' + sitedata[id - 1].file_name + '">', '<li class="currPage"><a href="' + sitedata[id - 1].file_name + '">');

          sitedata[id - 1].navigationSub_list = '<ul>' + tempUl2 + '</ul>';
        });

        tempUl = '';
        tempArr = [];
      }

    }
  })
}



function createAltPageLists() {
  let fpList = []

  sitedata.forEach((item) => {
    if (item.type == 'featured-project') {
      fpList.push(item)
    }
  });

  sitedata[0].featuredProjects = fpList;

}



// generate files
function generateHtml() {
  sitedata.forEach((item) => {
    fs.readFile("src/templates/" + item.template, "utf-8", function(
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
  fs.writeFile(fileName, content, function(err) {
    if (err) throw err;
  });
}

// create folders
function createFolder() {
  fs.mkdirSync(outputDir);
  fs.mkdirSync(outputDir + "/css");
  fs.mkdirSync(outputDir + "/css/v" + outputVersion + "/");
}

function uniqueGenerator() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4());
}
