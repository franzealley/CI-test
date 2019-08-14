//require file system module
const fs = require('fs');
//require http module
const http = require('http');
//require url module
const url = require('url');

//db connection
var mysql = require('mysql');

var con = mysql.createConnection({
socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
  host: "127.0.0.1",
  user: "root",
  password: "root"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//read file
const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');

//convert to js object
const laptopData = JSON.parse(json);

//create web server, pass in call back function that is run everytime someone accesses the web server
const server = http.createServer((req, res) => {

    //get path name from url typed in browser
    const pathName = url.parse(req.url, true).pathname;

    //read id from URL
    const id = url.parse(req.url, true).query.id;
    
    
    //Routing - express can be used to handle routing instead of coding like this
    //show products page by default (/)
    if(pathName === '/products' || pathName === '/') {
        res.writeHead(200, {'Content-type':'text/html'});

        //read overview page template
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => { 

            let overviewOutput = data;
            //read card template
            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => { 
                //loop through laptops in data
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                //replace cards placeholder in overview html with each card
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);
                res.end(overviewOutput);
            });
            
        });            
    } 
    //show laptop page but only as long as id is smaller than data length e.g. 4 or less
    else if (pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, {'Content-type':'text/html'});
        //wait til node finishes reading file before callback
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => {
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);
           
            res.end(output);
        });
        //res.end(`this is the laptop page for laptop ${id}!`);
    } 
    //Images
    //regex checker, if a file has an extension jpg etc
    //test if pathname contains those extensions
    //if so read the image and send it back as the response
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) {
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, {'Content-type':'image/jpg'});
            res.end(data);
        });

    } 
    else {
        res.writeHead(404, {'Content-type':'text/html'});
        res.end('URL was not found');
    }    
});

//keep listening on a certain port on a certain IP address, as soon as server starts listening run callback func
server.listen(1337, '127.0.0.1', () => {
    console.log('listening for requests now');
});

function replaceTemplate(html, laptop) {

    //uses regex
    //replace placdeholders in html file with data values e.g. product name for laptop id 1

    let output= html.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output= output.replace(/{%IMAGE%}/g, laptop.image);
    output= output.replace(/{%PRICE%}/g, laptop.price);
    output= output.replace(/{%SCREEN%}/g, laptop.screen);
    output= output.replace(/{%CPU%}/g, laptop.cpu);
    output= output.replace(/{%STORAGE%}/g, laptop.storage);
    output= output.replace(/{%RAM%}/g, laptop.ram);
    output= output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output= output.replace(/{%ID%}/g, laptop.id);

    return output;
        
}