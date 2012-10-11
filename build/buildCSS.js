var fs = require('fs');

function makeJSON(){

var main = fs.readFileSync('src/CSS/leaflet.css','utf8');
var ie = fs.readFileSync('src/CSS/leaflet.ie.css','utf8');

var css = {main:clean(main),ie:clean(ie)};

var out = JSON.stringify(css);

fs.writeFile("./src/CSS/CSS.json", "L._css = " + out);
}

exports.json= makeJSON;

function clean(t){
    return t.replace(/\/\*.*\*\//mg,"").replace(/(\r|\n|\t)/g,"");
}