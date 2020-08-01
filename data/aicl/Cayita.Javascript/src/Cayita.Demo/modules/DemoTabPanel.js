(function() {
	////////////////////////////////////////////////////////////////////////////////
	// Cayita.Demo.DemoTabPanel
	var $DemoTabPanel = function() {
	};
	$DemoTabPanel.execute = function(parent) {
		var d = Cayita.UI.Atom('div', null, 'bs-docs-example');
		var $t1 = Cayita.UI.TabPanelOptions();
		$t1.tabsPosition = 'top';
		$t1.bordered = true;
		var top = Cayita.UI.TabPanel($t1);
		top.content.style.minHeight = '100px';
		var t1 = Cayita.UI.Tab();
		t1.set_caption('First Tab');
		$(t1.body).append('Firs tab body');
		Cayita.AlertFn.Success(t1.body.firstChild, 'Cayita is awesome', false, 0);
		top.add(t1);
		top.addTab(function(tab) {
			tab.set_caption('Second Tab');
			$(tab.body).addClass('well');
			$(tab.body).append('Hello second tab');
			tab.body.style.color = 'red';
		});
		top.addTab(function(tab1) {
			tab1.set_caption('El Coyote');
			tab1.body.append(Cayita.UI.Atom('div', null, null, null, function(cd) {
				cd.className = 'span1';
				var $t2 = Cayita.UI.Atom('img', null, null);
				$t2.src = 'img/coyote.jpg';
				cd.append($t2);
			}));
			tab1.body.append(Cayita.UI.Atom('div', null, null, null, function(cd1) {
				cd1.className = 'span11';
				$(cd1).append($DemoTabPanel.get_$coyoteText());
			}));
		});
		d.append(top);
		$(parent).append(Cayita.Fn.header('Tabs on top', 3)).append(d);
		var $t3 = Cayita.UI.TabPanelOptions();
		$t3.tabsPosition = 'right';
		var right = Cayita.UI.TabPanel($t3, function(pn) {
			pn.addTab(function(tab2) {
				tab2.set_caption('First tab');
				tab2.body.append(Cayita.Fn.header('Hello first tab', 3));
			});
			pn.addTab(function(tab3) {
				tab3.set_caption('Second tab');
				$(tab3.body).addClass('well');
				$(tab3.body).append('Hello second tab');
				tab3.body.style.color = 'blue';
				tab3.body.style.height = '80px';
			});
			pn.addTab(function(tab4) {
				tab4.set_caption('El Coyote');
				tab4.body.append(Cayita.UI.Atom('div', null, null, null, function(cd2) {
					cd2.className = 'span1';
					var $t4 = Cayita.UI.Atom('img', null, null);
					$t4.src = 'img/coyote.jpg';
					cd2.append($t4);
				}));
				tab4.body.append(Cayita.UI.Atom('div', null, null, null, function(cd3) {
					cd3.className = 'span11';
					$(cd3).append($DemoTabPanel.get_$coyoteText());
				}));
			});
		});
		Cayita.UI.Atom('div', null, null, null, function(ex) {
			ex.className = 'bs-docs-example';
			ex.append(right);
			$(parent).append(Cayita.Fn.header('Tabs on right', 3)).append(ex);
		});
		right.show(2);
		var $t5 = Cayita.UI.TabPanelOptions();
		$t5.tabsPosition = 'below';
		var bottom = Cayita.UI.TabPanel($t5, function(pn1) {
			pn1.addTab(function(tab5) {
				tab5.set_caption('First tab');
				tab5.body.append(Cayita.Fn.header('Hello first tab', 3));
			});
			pn1.addTab(function(tab6) {
				tab6.set_caption('Second tab');
				$(tab6.body).addClass('well');
				$(tab6.body).append('Hello second tab');
				tab6.body.style.color = 'blue';
				tab6.body.style.height = '80px';
			});
			pn1.addTab(function(tab7) {
				tab7.set_caption('El Coyote');
				tab7.body.append(Cayita.UI.Atom('div', null, null, null, function(cd4) {
					cd4.className = 'span1';
					var $t6 = Cayita.UI.Atom('img', null, null);
					$t6.src = 'img/coyote.jpg';
					cd4.append($t6);
				}));
				tab7.body.append(Cayita.UI.Atom('div', null, null, null, function(cd5) {
					cd5.className = 'span11';
					$(cd5).append($DemoTabPanel.get_$coyoteText());
				}));
			});
		});
		bottom.content.style.minHeight = '150px';
		Cayita.UI.Atom('div', null, null, null, function(ex1) {
			ex1.className = 'bs-docs-example';
			ex1.append(bottom);
			$(parent).append(Cayita.Fn.header('Tabs on bottom', 3)).append(ex1);
		});
		bottom.show(1);
		var $t7 = Cayita.UI.TabPanelOptions();
		$t7.tabsPosition = 'left';
		$t7.bordered = true;
		var left = Cayita.UI.TabPanel($t7, function(pn2) {
			pn2.addTab(function(tab8) {
				tab8.set_caption('First tab');
				tab8.body.append(Cayita.Fn.header('Hello first tab', 3));
			});
			pn2.addTab(function(tab9) {
				tab9.set_caption('Second tab');
				$(tab9.body).addClass('well');
				$(tab9.body).append('Hello second tab');
				tab9.body.style.color = 'blue';
				tab9.body.style.height = '80px';
			});
			pn2.addTab(function(tab10) {
				Cayita.UI.Atom('img', null, null, null, function(i) {
					i.src = 'img/coyote.jpg';
					i.style.height = '106px';
				}, tab10);
				Cayita.UI.Label(null, 'El Coyote', null, tab10);
				$(tab10.body).append($DemoTabPanel.get_$coyoteText());
			});
		});
		left.content.style.minHeight = '220px';
		Cayita.UI.Atom('div', null, null, null, function(ex2) {
			ex2.className = 'bs-docs-example';
			ex2.append(left);
			$(parent).append(Cayita.Fn.header('Tabs on left', 3)).append(ex2);
		});
		left.show(0);
		parent.append(Cayita.Fn.header('C# code', 3));
		var rq = $.get('code/demotabpanel.html');
		rq.done(function(s) {
			var code = Cayita.UI.Atom('div');
			code.innerHTML = s;
			parent.append(code);
		});
	};
	$DemoTabPanel.get_$coyoteText = function() {
		return '<i><b>El <a href=\'https://es.wikipedia.org/wiki/Coyote\' title=\'Coyote\' target=\'_blank\'>Coyote</a> \ny el <a href=\'https://es.wikipedia.org/wiki/Geococcyx_californianus\' title=\'Geococcyx californianus\' \ntarget=\'_blank\'>Correcaminos</a></b></i> (<i><b>Wile E. Coyote</b> and the <b>Road Runner</b></i>) son los personajes \nde una serie <a href=\'https://es.wikipedia.org/wiki/Estados_Unidos\' title=\'Estados Unidos\' \ntarget=\'_blank\'>estadounidense</a> de <a href=\'https://es.wikipedia.org/wiki/Dibujos_animados\' \ntitle=\'Dibujos animados\' target=\'_blank\'>dibujos animados</a> creada en el año de \n<a href=\'https://es.wikipedia.org/wiki/1949\' title=\'1949\' target=\'_blank\'>1949</a> por el animador \n<a href=\'https://es.wikipedia.org/wiki/Chuck_Jones\' title=\'Chuck Jones\' target=\'_blank\'>Chuck Jones</a> \npara <a href=\'https://es.wikipedia.org/wiki/Warner_Brothers\' title=\'Warner Brothers\' \ntarget=\'_blank\'>Warner Brothers</a>. Chuck Jones se inspiró para crear a estos personajes en un libro de \n<a href=\'https://es.wikipedia.org/wiki/Mark_Twain\' title=\'Mark Twain\' target=\'_blank\'>Mark Twain</a>, \ntitulado <i>Roughin It</i>, en el que Twain denotaba que los coyotes hambrientos podrían cazar un correcaminos.  \n<a href=\'https://es.wikipedia.org/wiki/El_Coyote_y_el_Correcaminos\' title=\'Coyote\' \ntarget=\'_blank\'>El Coyote (wikipedia)</a> ';
	};
	ss.registerClass(global, 'DemoTabPanel', $DemoTabPanel);
})();
