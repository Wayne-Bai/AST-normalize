require.config({
  "baseUrl": '/',
  "paths": {
    "jquery":     "components/jquery/jquery",
    "jeditable":  "components/jquery.jeditable/index",
    "select2":     "components/select2/index",
    "jaderuntime":"components/jam-jade-runtime/jade.runtime",
    "scrollto":   "components/jquery-scrollto/scripts/jquery.scrollto",
    "showdown":   "components/showdown/src/showdown",
    "reqwest":    "components/reqwest/reqwest",
    "text":       "components/text/text",
    "bootstrap":  "components/bootstrap/docs/assets/js/bootstrap",
    "zeroclipb":  "components/ZeroClipboard/ZeroClipboard",
    "Jvent":      "components/jvent/index",
    "md5":        "components/JavaScript-MD5/md5",
    "ot":         "components/ot/index",
    "CodeMirror": "vendor/codemirror-compressed",
    "socket.io":  "components/socket.io-client/dist/socket.io"
  },
  "shim": {
    "bootstrap": ["jquery"],
    "jeditable": ["jquery"],
    "scrollto":  ["jquery"],
    "select2":   ["jquery"],
    "zeroclipb": {
      exports: "ZeroClipboard"
    },
    "CodeMirror": {
      exports: "CodeMirror"
    },
    "ot": {
      exports: "ot"
    }
  }
});