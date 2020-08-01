var common=require(__dirname+'/../lib/common.js');

exports.run=function(req,res){
	rw.sess.start(req,res);
	if(!common.checkAuth(req,res)){
		req=null;
		res=null;
		return;
	}
	if(!req.session.data['rouwan_path']){
		req.session.data['rouwan_path']=__dirname;
	}
	rw.http.zout(
		rw.t.render(
			__dirname+'/../template/page.html',{'TITLE':'Code - ','LINK':'<script type="text/javascript" src="./js/code.js?sp=2"></script><script type="text/javascript" src="./js/ace/ace.js?sp=3"></script><link href="./css/code.css?sp=2" rel="stylesheet" type="text/css" />','MCUR2':' cur','WRAPPER':rw.t.render(__dirname+'/../template/code.html',{'PATH':req.session.data['rouwan_path']}),'V':rw.config.version}
		),
		req,
		res
	);
	req=null;
	res=null;
};