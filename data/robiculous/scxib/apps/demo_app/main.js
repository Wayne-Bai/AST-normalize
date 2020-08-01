// ==========================================================================
// Project:   DemoApp
// Copyright: ©2010 Robert Linton
// Contributors: Devin Torres, Kurt Williams
// ==========================================================================
/*globals DemoApp */

DemoApp.main = function main() {

  SCXIB.loadXibsWithOptions([    
    {
      url: sc_static('MainPage.xib'),
      namespace: DemoApp.NAMESPACE,
      pageName: 'mainPage',
      callback: function () {
        var people = DemoApp.store.find(DemoApp.Person);
        DemoApp.demoController.set('people', people);
        DemoApp.getPath('mainPage.mainPane').append();
      }
    },    
    {
      url: sc_static('Panel1.xib'),
      namespace: DemoApp.NAMESPACE,
      panelName: 'arTestPane'
    },
  ]);
  
};

function main() { DemoApp.main(); }
