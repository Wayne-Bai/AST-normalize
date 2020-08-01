var expect = chai.expect;
describe("Dashboard specs",function(){
	//initializing the dashboard
	describe("When the dashboard is initialized",function(){
		
		var widgets;
		var currentDashboard;
		
		var creationCompleteSpy;

		beforeEach(function(){
			widgets =  [{
				widgetTitle:"Foo widget",
				widgetId : "W0001",
				enableRefresh:true,
				widgetContent: "this is a foo widget"
			},{
				widgetTitle:"Bar widget",
				widgetId : "W0002",
				enableRefresh:false,
				widgetContent: "this is a bar widget"
			}];
			creationCompleteSpy = sinon.spy();
			$(".dashboardContainer").bind("sdashboardcreationcomplete", creationCompleteSpy);
			currentDashboard =  $(".dashboardContainer").sDashboard({
				dashboardData : widgets
			});

		});
		afterEach(function(){
			currentDashboard = undefined;
			widgets = undefined;
			creationCompleteSpy = undefined;
			$(".dashboardContainer").empty();
		})

		it("should create correct number of widgets",function(){
			var arr = $(".dashboardContainer").sDashboard("getDashboardData");
			expect(arr.length).to.equal(widgets.length);
		});

		it("should trigger sdashboardcreationcomplete event",function(){
			expect(creationCompleteSpy.called).to.be.true;
		});

		it("should set the title of each widget correctly",function(){
			expect(currentDashboard.find('li').first().find('.sDashboardWidgetHeader').text()).to.equal(widgets[0].widgetTitle);
		});

		it("should set the content of each widget correctly",function(){
			expect(currentDashboard.find('li').first().find('.sDashboardWidgetContent').text()).to.equal(widgets[0].widgetContent);
		});

		it("should show refresh button on the first widget",function(){
			expect(currentDashboard.find('li').first().find('.sDashboard-icon.sDashboard-refresh-icon ').length).to.equal(1);
		});

		it("should hide refresh button on the second widget",function(){
			expect(currentDashboard.find('li').eq(1).find('.sDashboard-icon.sDashboard-refresh-icon ').length).to.equal(0);
		});

		//Adding a widget
		describe("When the addWidget method is called",function(){
			beforeEach(function(){
				$(".dashboardContainer").sDashboard("addWidget",{
					widgetTitle: "Baz Widget",
					widgetId: "W0003",
					widgetContent:"this is baz widget"
				});
			});

			it("should add a new widget to the dashboard",function(){
				expect($(".dashboardContainer").sDashboard("getDashboardData").length).to.equal(3);
			});
		});

		//Removing a widget
		describe("When the removeWidget method is called",function(){
			beforeEach(function(){
				$(".dashboardContainer").sDashboard("removeWidget", "W0003");
			});
			it("should remove the widget from the dashboard",function(){
				expect($(".dashboardContainer").sDashboard("getDashboardData").length).to.equal(2);
			});
		});

		//Getting widget data
		describe("When the getDashboardData method is called",function(){
			it("should return the correct total number of widgets",function(){
				expect($(".dashboardContainer").sDashboard("getDashboardData").length).to.equal(2);
			});
		});

		//Refreshing a widget
		describe("When the refresh button is clicked on the widget",function(){
			var refreshSpy;
			beforeEach(function(){
				refreshSpy = sinon.spy();
				$(".dashboardContainer").sDashboard("addWidget",{
					widgetTitle: "Baz Widget2",
					widgetId: "W0004",
					widgetContent:"this is baz widget2",
					enableRefresh: true,
					refreshCallBack : refreshSpy
				});
				currentDashboard.find('li').eq(0).find('.sDashboard-icon.sDashboard-refresh-icon ').trigger('click');
			});
			afterEach(function(){
				refreshSpy = undefined;
			})
			it("should call the refreshCallBack function",function(){
				expect(refreshSpy.called).to.be.true;
			});
		});

		//maximize button click
		describe("When the maximize button is clicked",function(){
			var maximizeSpy;
			beforeEach(function(){
				maximizeSpy = sinon.spy();
				$(".dashboardContainer").bind("sdashboardwidgetmaximized", maximizeSpy);		
				currentDashboard.find('li').eq(0).find('.sDashboard-icon.sDashboard-circle-plus-icon').trigger('click');	
			});
			afterEach(function(){
				maximizeSpy = undefined;
				$(".sDashboard-overlay").remove();
			});
			it("should trigger a sdashboardwidgetmaximized event",function(){
				expect(maximizeSpy.called).to.be.true;
			});
		});

		//minimize button click
		describe("When the minimize button is clicked",function(){
			var minimizeSpy;
			beforeEach(function(){
				minimizeSpy = sinon.spy();
				$(".dashboardContainer").bind("sdashboardwidgetminimized", minimizeSpy);		
				currentDashboard.find('li').eq(0).find('.sDashboard-icon.sDashboard-circle-plus-icon').trigger('click');
				currentDashboard.find('li').eq(0).find('.sDashboard-icon.sDashboard-circle-minimize-icon').trigger('click');	
			});
			afterEach(function(){
				minimizeSpy = undefined;
				$(".sDashboard-overlay").remove();
			});
			it("should trigger a sdashboardwidgetminimized event",function(){
				expect(minimizeSpy.called).to.be.true;
			});
		});

		//when the remove button is clicked
		describe("When the close button is clicked",function(){
			var closeSpy;
			beforeEach(function(){
				closeSpy = sinon.spy();
				$(".dashboardContainer").bind("sdashboardstatechanged", closeSpy);		
				currentDashboard.find('li').eq(0).find('.sDashboard-icon.sDashboard-circle-remove-icon').trigger('click');
			});
			afterEach(function(){
				closeSpy = undefined;
			});
			it("should trigger a sdashboardstatechanged event",function(){
				expect(closeSpy.called).to.be.true;
			});
		});
		
	});

})