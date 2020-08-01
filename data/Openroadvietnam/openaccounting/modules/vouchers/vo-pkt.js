/*Copyright (C) 2015  Sao Tien Phong (http://saotienphong.com.vn)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var PostBook = require("../../libs/post-book");
var PostSocai = require("../../libs/post-socai");
var arrayfuncs = require("../../libs/array-funcs");
var Vatvao = require("../../models/vatvao");
var Vatra = require("../../models/vatra");
var Vsocai = require("../../models/vsocai");
var socai = require("../../models/socai");
var dvcs = require("../../models/dvcs");
var account = require("../../models/account");
var dmdt = require("../../models/dmdt");
var customer = require("../../models/customer");
var model = require("../../models/pkt");
var controller = require("../../controllers/controller");
var valid_acc_cust = require("../../libs/validator-acc-cust");
var async = require("async");
var ma_ct ='PKT';
var valid_detail = function(user,obj,fn){
	var id_app = obj.id_app;
	for(var i=0;i<obj.details.length;i++){
		detail = obj.details[i];
		detail.line = i;
		if(obj.ma_nt =='VND'){
			detail.tien=detail.tien_nt;
		}
	}
	for(var i=0;i<obj.vatvaos.length;i++){
		vatvao = obj.vatvaos[i];
		vatvao.line = i;
		if(obj.ma_nt =='VND'){
			vatvao.t_thue=vatvao.t_thue_nt;
		}
	}
	for(var i=0;i<obj.vatras.length;i++){
		vatra = obj.vatras[i];
		vatra.line = i;
		if(obj.ma_nt =='VND'){
			vatra.t_thue=vatra.t_thue_nt;
		}
	}
	//valid account
	async.map(obj.details,function(detail,mapcallback){
		async.parallel([
			function(callback){
				valid_acc_cust.checkAccAndCust(id_app,detail.tk_no,detail.ma_kh_no,function(error){
					if(error) return callback(error);
					callback(null,true);
				});
			},
			function(callback){
				valid_acc_cust.checkAccAndCust(id_app,detail.tk_co,detail.ma_kh_co,function(error){
					if(error) return callback(error);
					callback(null,true);
				});
			}
		],function(e,r){
			if(e) return mapcallback(e);
			mapcallback(null,true);
		});
		
	},function(error,result){
		if(error) return fn(error);
		fn();
	});
}
module.exports = function(router){
	this.contr = new controller(router,model,ma_ct.toLowerCase(),{
		sort:		{ngay_ct:-1,so_ct:1}
	});
	this.contr.route();
	//post data
	this.contr.post = function(obj){
		//post vatvao
		var postvatvao = new PostBook(obj,obj.vatvaos,Vatvao);
		postvatvao.run();
		//post vatra
		var postvatra = new PostBook(obj,obj.vatras,Vatra);
		postvatra.run();
		
		//post socai
		var details_sc =[];
		//vatvao
		obj.vatvaos.forEach(function(v){
			var vatvao = v.toObject();
			vatvao.tk_no = vatvao.tk_thue_no;
			vatvao.tk_co = vatvao.tk_du_thue;
			vatvao.tien_nt = vatvao.t_thue_nt;
			vatvao.tien = vatvao.t_thue;
			details_sc.push(vatvao);
		});
		
		//vatra
		obj.vatras.forEach(function(v){
			var vatra = v.toObject();
			vatra.tk_no = vatra.tk_du_thue;
			vatra.tk_co = vatra.tk_thue_co;
			vatra.tien_nt = vatra.t_thue_nt;
			vatra.tien = vatra.t_thue;
			details_sc.push(vatra);
		});
		//detail
		obj.details.forEach(function(d){
			details_sc.push(d.toObject());
		});
		var postsocai = new PostSocai(obj,details_sc);
		postsocai.run();
	}
	//deleted 
	this.contr.deleted = function(user,obj,callback){
		id_app = user.current_id_app;
		//delete vsocai
		Vsocai.remove({id_ct:obj._id},function(error){
			if(error) return console.error(error);
			console.log("deleted socai of voucher " + obj.so_ct);
		});
		//delete socai
		socai.remove({id_ct:obj._id},function(error){
			if(error) return console.error(error);
			console.log("deleted socai of voucher " + obj.so_ct);
		});
		//delete vatvao
		Vatvao.remove({id_ct:obj._id},function(error){
			if(error) return console.error(error);
			console.log("deleted vatvao of voucher " + obj.so_ct);
		});
		//delete vatra
		Vatra.remove({id_ct:obj._id},function(error){
			if(error) return console.error(error);
			console.log("deleted vatra of voucher " + obj.so_ct);
		});
		callback(null,obj);
	}
	this.contr.creating= function(user,obj,next){
			id_app = user.current_id_app;
			//valid
			valid_detail(user,obj,function(error){
				if(error) return next(error);
				next(null,obj); 
			});
			
		}
	this.contr.updating = function(user,data,obj,next){ 
		id_app = user.current_id_app;
		//valid
		valid_detail(user,data,function(error){
			if(error) return next(error);
			next(null,data,obj); 
		});
	}
	this.contr.view = function(user,items,fn){
		id_app = user.current_id_app;
		async.parallel({
			dv:function(callback){
				items.joinModel(id_app,dvcs,[{akey:'ma_dvcs',bkey:'_id',fields:[{name:'ten_dvcs',value:'ten_dvcs'}]}],function(kq){
					callback();
				});
			},
			t_tien:function(callback){
				items.forEach(function(r){
					if(r.details){
						
						r.t_tien = r.details.csum('tien')
						r.t_tien_nt = r.details.csum('tien_nt')
						
					}
					if(r.vatvaos){
						r.t_thue_vao = r.vatvaos.csum('t_thue')
						r.t_thue_vao_nt = r.vatvaos.csum('t_thue_nt')
					}
					if(r.vatras){
						r.t_thue_ra = r.vatras.csum('t_thue')
						r.t_thue_ra_nt = r.vatras.csum('t_thue_nt')
					}
				});
				
				
				callback();
			},
			details_tk:function(callback){
				async.map(
					items,
					function(r,callback1){
						var details = r.details;
						details.joinModel(id_app,account,[{akey:'tk_no',bkey:'tk',fields:[{name:'ten_tk_no',value:'ten_tk'}]},
															{akey:'tk_co',bkey:'tk',fields:[{name:'ten_tk_co',value:'ten_tk'}]}],function(kq){
							callback1();
						});
					},
					function(error){
						
						callback();
					}
				);
			},
			details_customer:function(callback){
				async.map(
					items,
					function(r,callback1){
						var details = r.details;
						details.joinModel(id_app,customer,[{akey:'ma_kh_no',bkey:'ma_kh',fields:[{name:'ten_kh_no',value:'ten_kh'}]},
															{akey:'ma_kh_co',bkey:'ma_kh',fields:[{name:'ten_kh_co',value:'ten_kh'}]}],function(kq){
							callback1();
						});
					},
					function(error){
						
						callback();
					}
				);
			},
			details_dt:function(callback){
				async.map(
					items,
					function(r,callback1){
						var details = r.details;
						details.joinModel(id_app,dmdt,[{akey:'ma_dt',bkey:'ma_dt',fields:[{name:'ten_dt',value:'ten_dt'}]}
															],function(kq){
							callback1();
						});
					},
					function(error){
						
						callback();
					}
				);
			}
		},function(error,results){
			
			fn(null,items);
		});
	}
}