(function() {
	////////////////////////////////////////////////////////////////////////////////
	// Cayita.Demo.DemoPanels
	var $DemoPanels = function() {
	};
	$DemoPanels.execute = function(parent) {
		var code = Cayita.UI.Atom('div');
		Cayita.UI.Atom('div', null, null, null, function(d) {
			d.className = 'bs-docs-example';
			Cayita.UI.CreateContainer$1(d, function(ct) {
				Cayita.UI.CreateRowFluid$1(ct, function(r) {
					Cayita.UI.Atom('div', null, null, null, function(sp) {
						sp.className = 'span5';
						var p1 = $DemoPanels.$createPanel('Apps', false, false);
						Cayita.UI.Atom('div', null, null, null, function(pi) {
							pi.className = 'c-icons';
							$(pi).append('<style>img {height: 40px;}  .c-icon {height: 95px;}</style>');
							var $t1 = $DemoPanels.$getApps();
							for (var $t2 = 0; $t2 < $t1.length; $t2++) {
								var app = { $: $t1[$t2] };
								Cayita.UI.ImgPicture(null, null, ss.mkdel({ app: app }, function(img) {
									img.img.src = this.app.$.icon;
									img.set_text(this.app.$.title);
									img.add_clicked(ss.mkdel({ app: this.app }, function(e) {
										e.preventDefault();
										Alertify.log.info(this.app.$.title, 5000);
									}));
								}), pi);
							}
							p1.add(pi);
						});
						var p2 = $DemoPanels.$createPanel('Demo', false, false);
						var color = Cayita.UI.TextField();
						var bb = Cayita.UI.Button('Change background', 'btn', null);
						bb.add_clicked(function(e1) {
							p2.body.style.backgroundColor = color.input.get_value();
						});
						var bc = Cayita.UI.Button('collapse', 'btn', null);
						bc.add_clicked(function(e2) {
							p2.collapse();
						});
						p2.add(color);
						p2.add(bb);
						p2.add(bc);
						$(sp).append(p1).append(p2);
					}, r);
					Cayita.UI.Atom('div', null, null, null, function(sp1) {
						sp1.className = 'span5';
						var p11 = $DemoPanels.$createPanel('El Coyote', false, false);
						Cayita.UI.Atom('div', null, null, null, function(cy) {
							cy.className = 'span2';
							Cayita.UI.Atom('img', null, null, null, function(i) {
								i.src = 'img/coyote.jpg';
								i.style.height = '100px';
							}, cy);
							p11.add(cy);
						});
						Cayita.UI.Atom('div', null, null, null, function(cy1) {
							cy1.className = 'span10';
							$(cy1).append('<i><b>El <a href=\'https://es.wikipedia.org/wiki/Coyote\' title=\'Coyote\' target=\'_blank\'>Coyote</a> y el <a href=\'https://es.wikipedia.org/wiki/Geococcyx_californianus\' title=\'Geococcyx californianus\' target=\'_blank\'>Correcaminos</a></b></i> (<i><b>Wile E. Coyote</b> and the <b>Road Runner</b></i>) son los personajes de una serie <a href=\'https://es.wikipedia.org/wiki/Estados_Unidos\' title=\'Estados Unidos\' target=\'_blank\'>estadounidense</a> de <a href=\'https://es.wikipedia.org/wiki/Dibujos_animados\' title=\'Dibujos animados\' target=\'_blank\'>dibujos animados</a> creada en el año de <a href=\'https://es.wikipedia.org/wiki/1949\' title=\'1949\' target=\'_blank\'>1949</a> por el animador <a href=\'https://es.wikipedia.org/wiki/Chuck_Jones\' title=\'Chuck Jones\' target=\'_blank\'>Chuck Jones</a> para <a href=\'https://es.wikipedia.org/wiki/Warner_Brothers\' title=\'Warner Brothers\' target=\'_blank\'>Warner Brothers</a>. Chuck Jones se inspiró para crear a estos personajes en un libro de <a href=\'https://es.wikipedia.org/wiki/Mark_Twain\' title=\'Mark Twain\' target=\'_blank\'>Mark Twain</a>, titulado <i>Roughin It</i>, en el que Twain denotaba que los coyotes hambrientos podrían cazar un correcaminos.  \n<a href=\'https://es.wikipedia.org/wiki/El_Coyote_y_el_Correcaminos\' title=\'Coyote\' target=\'_blank\'>El Coyote (wikipedia)</a> ');
							p11.add(cy1);
						});
						var p21 = $DemoPanels.$createPanel('Table', false, false);
						var tb = Cayita.UI.Table($Cayita_Demo_App)(null, 'title');
						tb.load($DemoPanels.$getApps(), false);
						p21.add(tb);
						$(sp1).append(p11).append(p21);
					}, r);
				});
			});
			var wn = 1;
			Cayita.UI.Button(null, null, null, function(bt) {
				bt.set_text('Window I');
				bt.add_clicked(function(evt) {
					var $t3 = Cayita.UI.PanelOptions();
					$t3.overlay = true;
					var $t4 = Cayita.UI.Panel($t3);
					$t4.set_caption('Window ' + (wn++).toString());
					$t4.set_left((wn * 5).toString() + 'px');
					$t4.set_top((wn * 15).toString() + 'px');
					$t4.set_width('300px');
					$t4.set_height('100px');
					$t4.do_show(true);
				});
			}, d);
			Cayita.UI.Button(null, null, null, function(bt1) {
				bt1.set_text('Window II');
				bt1.add_clicked(function(evt1) {
					var $t5 = Cayita.UI.PanelOptions();
					$t5.overlay = true;
					$t5.caption = 'Custom Close Icon and Handler';
					$t5.left = '200px';
					$t5.top = '300px';
					$t5.width = 'auto';
					$t5.closeIconClass = 'icon-th-large';
					$t5.closeIconHandler = function(p) {
						p.set_caption('Close icon changed !!!');
						p.closeIcon.className = 'icon-remove-circle';
						p.set_closeIconHandler(function(pn) {
							pn.close();
							Alertify.log.error('Panel was closed', 5000);
						});
						p.set_height('400px');
					};
					var panel = Cayita.UI.Panel($t5);
					panel.add(Cayita.UI.Button(null, null, null, function(b) {
						b.set_text('click me !');
						b.style.width = '100%';
						b.style.height = '100%';
						b.add_clicked(function(e3) {
							Alertify.log.success('button clicked', 5000);
						});
					}, null));
					panel.do_show(true);
				});
			}, d);
			Cayita.UI.Button(null, null, null, function(bt2) {
				bt2.set_text('Window III');
				bt2.add_clicked(function(evt2) {
					var $t6 = Cayita.UI.PanelOptions();
					$t6.overlay = true;
					$t6.caption = 'no closable, no collapsible';
					$t6.left = '200px';
					$t6.top = '300px';
					$t6.width = 'auto';
					$t6.collapsible = false;
					$t6.closable = false;
					var panel1 = Cayita.UI.Panel($t6);
					panel1.add(Cayita.UI.Button(null, null, null, function(b1) {
						b1.set_text('click me !');
						b1.style.width = '100%';
						b1.style.height = '100%';
						b1.add_clicked(function(e4) {
							panel1.set_caption('now closable and  collapsible');
							panel1.closable(true);
							panel1.collapsible(true);
							b1.disabled = true;
						});
					}, null));
					panel1.do_show(true);
				});
			}, d);
			$(d).append(Cayita.Fn.header('C# code', 4)).append(code);
			parent.append(d);
		});
		var rq = $.get('code/demopanels.html');
		rq.done(function(s) {
			code.innerHTML = s;
		});
	};
	$DemoPanels.$createPanel = function(caption, draggable, closable) {
		var $t1 = Cayita.UI.PanelOptions();
		$t1.draggable = draggable;
		$t1.closable = closable;
		$t1.caption = caption;
		var p = Cayita.UI.Panel($t1);
		p.body.style.paddingTop = '10px';
		p.body.style.paddingBottom = '5px';
		return p;
	};
	$DemoPanels.$getApps = function() {
		var $t1 = [];
		var $t2 = $Cayita_Demo_App.$ctor();
		$t2.title = 'Calculator';
		$t2.icon = 'img/calculator.png';
		ss.add($t1, $t2);
		var $t3 = $Cayita_Demo_App.$ctor();
		$t3.title = 'Control Panel';
		$t3.icon = 'img/control.png';
		ss.add($t1, $t3);
		var $t4 = $Cayita_Demo_App.$ctor();
		$t4.title = 'Firewall Settings';
		$t4.icon = 'img/firewall.png';
		ss.add($t1, $t4);
		var $t5 = $Cayita_Demo_App.$ctor();
		$t5.title = 'Spreadsheet';
		$t5.icon = 'img/calc.png';
		ss.add($t1, $t5);
		var $t6 = $Cayita_Demo_App.$ctor();
		$t6.title = 'Mail';
		$t6.icon = 'img/mail.png';
		ss.add($t1, $t6);
		var $t7 = $Cayita_Demo_App.$ctor();
		$t7.title = 'Jack Sparrow Navigator';
		$t7.icon = 'img/web.png';
		ss.add($t1, $t7);
		var $t8 = $Cayita_Demo_App.$ctor();
		$t8.title = 'MonoDevelop';
		$t8.icon = 'img/monodevelop.png';
		ss.add($t1, $t8);
		var $t9 = $Cayita_Demo_App.$ctor();
		$t9.title = 'Tomboy';
		$t9.icon = 'img/tomboy.png';
		ss.add($t1, $t9);
		var $t10 = $Cayita_Demo_App.$ctor();
		$t10.title = 'Skype';
		$t10.icon = 'img/skype.png';
		ss.add($t1, $t10);
		var a = $t1;
		return a;
	};
	////////////////////////////////////////////////////////////////////////////////
	// Cayita.Demo.App
	var $Cayita_Demo_App = function() {
	};
	$Cayita_Demo_App.createInstance = function() {
		return $Cayita_Demo_App.$ctor();
	};
	$Cayita_Demo_App.$ctor = function() {
		var $this = new Object();
		$this.title = null;
		$this.icon = null;
		return $this;
	};
	ss.registerClass(global, 'DemoPanels', $DemoPanels);
	ss.registerClass(global, 'Cayita.Demo.App', $Cayita_Demo_App, Object);
})();
