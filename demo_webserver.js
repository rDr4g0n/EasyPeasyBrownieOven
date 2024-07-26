var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs"),
	port = process.argv[2] || 3006;

http.createServer(function(req, res){
    if (path.normalize(decodeURI(url.parse(req.url).pathname)) !== decodeURI(url.parse(req.url).pathname)) {
        res.statusCode = 403;
        res.end();
        return;
    }
	var uri = url.parse(req.url).pathname,
		filename = path.join(process.cwd(), uri);

	fs.exists(filename, function(exists){
		if(!exists){
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 Not Found\n");
			res.end();
			return;
		}

		if(fs.statSync(filename).isDirectory()){
			filename += "index.html";
		}

		fs.readFile(filename, "binary", function(err, file){
			if(err){
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write(err + "\n");
				res.end();
				return;
			}

			res.setHeader("Content-Type", getContentType(filename));
			res.writeHead(200);
			res.write(file, "binary");
			res.end();
		});
	});
}).listen(parseInt(port, 10));

function getContentType(fileName) {
	var ext = fileName.slice(fileName.lastIndexOf('.')),
		type;

	switch (ext) {
		case ".html":
			type = "text/html";
			break;

		case ".js":
			type = "text/javascript";
			break;

		case ".css":
			type = "text/css";
			break;

		default:
			type = "text/plain";
			break;
	}

	return type;
}

console.log("server running at http://localhost:"+ port);
