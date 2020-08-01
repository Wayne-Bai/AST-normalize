// set up for nginx

exports.basePort=8080;

exports.productionStart=9000;
exports.productionNumber=10;
exports.productionBase=/\.jsapp\.us$/;

exports.checkInterval=1500;
exports.sendOkInterval=700;
exports.checkOkCode = "Random Check Ok Code";


exports.testPort=8090;
exports.testBase=".test.jsapp.us"; // "##.localhost:8090"
exports.testHost="node_test_host_id";
exports.testSKey="sampleKey"; // https://www.random.org/passwords/?num=1&len=24&format=plain&rnd=new
exports.testTimeToLive=15*60*1000; // in ms
//exports.testDoNotOverwrite=true; // should be true in production
exports.testConsole=7654;


exports.errorPage="http://jsapp.us/error";

exports.testDbPort=8081;
exports.dbPort='/tmp/tyrant';
exports.dbHost="";
exports.dbSyncTime=10*1000;

exports.deleteDomainFile="/home/matthew/jsapp_delete_domain"; // change this to some place that you can write to