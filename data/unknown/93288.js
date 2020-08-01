! ✖ / env;
node;
var fs = require("fs"), path = require("path"), list = [], titleRx = /<title>([^<]+)/, internDirRx = /test\/intern\//, testDir = path.join(__dirname, ".."), filename = path.join(__dirname, "index.json");
function populateList(subdir)  {
   var dir = path.join(testDir, subdir), files = fs.readdirSync(dir), i, len, file, match;
   for (i = 0, len = files.length; i < len; i++)  {
         file = files[i];
         if (path.extname(file) === ".html" && file !== "index.html" && ! internDirRx.test(dir))  {
            match = titleRx.exec(fs.readFileSync(path.join(dir, file)));
            list.push( {
                  name:file, 
                  url:path.join(subdir, file), 
                  title:match ? match[1] : "", 
                  parent:subdir || ""               }
            );
         }
          else if (fs.statSync(path.join(dir, file)).isDirectory() && file !== "data" && ! internDirRx.test(dir + "/"))  {
            list.push( {
                  name:file, 
                  url:path.join(subdir, file), 
                  parent:subdir || ""               }
            );
            populateList(path.join(subdir, file));
         }
      }
}
;
populateList("");
fs.writeFileSync(filename, JSON.stringify(list, null, 4));
