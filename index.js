var rp = require('request-promise');// var cheerio = require('cheerio');
var JSSoup = require('jssoup').default;
var fs = require('fs');
var directory = "webpage";
if (process.argv.length >= 3) {
    var url = process.argv[2];
    if (!fs.existsSync(`./${directory}`)) {
        fs.mkdirSync(`./${directory}`);
    }
} else {
    process.exit();
}
// var url = 'http://eklavyaadwaitgurukul.ga';
// var url = "https://www.microsoft.com/en-in/software-download/windows8ISO";
// var url = "http://brickmohit.herokuapp.com";
// var url = "https://reactjs.org/";
// var url = "https://twitter.com/";
// var url = "https://www.amazon.in/";
// var url = "http://www.pmindia.gov.in/en/";
// var url = "https://www.hackerrank.com/";
// var url = "https://www.tesla.com/en_GB/?redirect=no";
// var url = "https://www.infosys.com";

// var url = "https://medium.com/s/story/a-millionaire-stunned-me-with-this-deep-question-that-will-make-you-think-hard-about-your-life-357ff1a097df";

var visited = [url]; rp(url).then(async (html) => {
    fs.writeFile(`./${directory}/index.html`, html, (err) => {
        if (err) throw err;
    });
    var soup = new JSSoup(html);
    //pulling all css
    var head = soup.find('head');
    await head.contents.forEach(tag => {
        if (tag.hasOwnProperty('attrs')) {
            if (tag.attrs.hasOwnProperty('href')) {
                if (tag.attrs.href.search("http") < 0) {
                    var src = tag.attrs.href;
                    pullStatic(src);
                }
            }
        }
    });
    //pulling all images
    var img = soup.findAll('img');
    await img.forEach(img => {
        var src = img.attrs.src;
        if (src.search(/http/i) < 0)
            pullStaticImg(src);
    })
    //pulling all links
    var a = soup.findAll('a');
    await a.forEach(a => {
        var href = a.attrs.href;
        if (href.length > 2) visited.forEach(l => {
            if (href[0] == '/') {
                link = `${url}${href}`;
            } else {
                link = `${url}/${href}`;
            } if (l != link) {
                //console.log(link);
                visited.push(link);
                pullAdditionWebPages(link);
            }
        })
    });
    console.log("doing scripts");
    //pulling scripts
    var scripts = soup.findAll('script');
    scripts.forEach(script => {
        if (script.hasOwnProperty('src')) {
            var src = script.attrs.src;
            pullStatic(src);
        }
    });
    html = null;
}).catch()

const pullAdditionWebPages = url => {
    rp(url).then(html => {
        var file = url.split("/");
        //console.log(file);
        if (file[file.length - 1].search(/\..*/) > 0) {
            var filename = file[file.length - 1];
        } else {
            var filename = `${file[file.length - 1]}.html`;
        }

        fs.writeFile(`./${directory}/${filename}`, html, (err) => {
            if (err) throw err;
        });

        var soup = new JSSoup(html);

        //pulling all css
        var head = soup.find('head');
        head.contents.forEach(tag => {
            if (tag.hasOwnProperty('attrs')) {
                if (tag.attrs.hasOwnProperty('href')) {
                    if (tag.attrs.href.search("http") < 0) {
                        var src = tag.attrs.href;
                        pullStatic(src);
                    }
                }
            }
        });

        //pulling all images
        var img = soup.findAll('img');
        img.forEach(img => {
            var src = img.attrs.src;
            pullStaticImg(src);
        })

        //pulling all links
        var a = soup.findAll('a');
        a.forEach(a => {
            var href = a.attrs.href;
            if (href.length > 2)
                visited.forEach(l => {
                    if (href[0] == '/') {
                        link = `${url}${href}`;
                    }
                    else {
                        link = `${url}/${href}`;
                    }
                    if (l != link) {
                        visited.push(link);
                        pullAdditionWebPages(link);
                    }
                })
        })

        html = null;
    })
        .catch(err => { })

}
const pullStaticImg = src => {
    if (src.search('http') > 0) {
        //console.log("link");
    } else {
        var dirs = src.split("/");
        var overallDir = `./${directory}/`;
        for (var i = 0; i < dirs.length - 1; i++) {
            dir = dirs[i];
            overallDir += "/" + dir;
            if (!fs.existsSync(overallDir)) {
                fs.mkdirSync(overallDir);
            }
        }
        var newUrl = url + "/" + src;
        const options = {
            url: newUrl,
            encoding: null
        };
        rp.get(options)
            .then(function (res) {
                const buffer = Buffer.from(res, 'utf8');
                if (!fs.existsSync(`./${directory}/` + src))
                    fs.writeFileSync(`./${directory}/` + src, buffer);
                //buffer.clear();
            })
            .catch()
    }
}

const pullStatic = src => {
    //console.log(src);
    var dirs = src.split("/");
    //console.log(dirs);
    var overallDir = `./${directory}/`;
    for (var i = 0; i < dirs.length - 1; i++) {
        dir = dirs[i];
        overallDir += "/" + dir;
        //console.log(dir);
        if (!fs.existsSync(overallDir)) {
            fs.mkdirSync(overallDir);
        }
    }
    var newUrl = url + "/" + src;
    //console.log(src);
    //console.log(newUrl);
    rp(newUrl)
        .then(css => {
            //console.log("./" + src);
            fs.writeFileSync(`./${directory}/` + src, css, (err) => {
                if (err) throw err;
            });
        })
        .catch()
}

// const puppetter = require('puppeteer');
// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setViewport({width:1280,height:800})
//     await page.goto('https://carmalou.com');

//     await browser.close();
// })();

// console.log(tag.contents.length);
        // let $ = cheerio.load(html);
        // console.log(html);
        // var openingTagPos = html.search(/<.*>/);
        // var closeingAnglePos = html.search(/>/);
        // var openingTag = html.slice(openingTagPos+1,closeingAnglePos);
        // var closeingTag = "</"+openingTag+">";
        // var closeingTagPos = html.search(closeingTag);
        // var res = html.slice(closeingAnglePos+1,closeingTagPos);
        // console.log(res);
        // console.log("-----");
        // console.log(html.slice(closeingTagPos,html.length+1));

        //console.log(tag);
        // // $('span.comhead').each((i,element)=>{
        // //     var a = $(this.prev);
        // //     console.log(a.text());
        // // })
        // $('div').each((i,element)=>{
        //     console.log(element.text());
        // })
