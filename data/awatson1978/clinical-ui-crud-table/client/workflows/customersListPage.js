Session.setDefault('customersReceivedData', false);
Session.setDefault('customersSearchFilter', '');
Session.setDefault('customersTableLimit', 20);
Session.setDefault('customersPaginationCount', 1);
Session.setDefault('customersSelectedPagination', 0);
Session.setDefault('customersSkipCount', 0);


//------------------------------------------------
// ROUTING

Router.map(function(){
  this.route('customersListPage', {
    path: '/customers',
    template: 'customersListPage',
    waitOn: function(){
      return Meteor.subscribe('customers');
    }
  });
});

//------------------------------------------------
// HELPERS

Template.customersListPage.helpers({
  customersList: function(){
    var customersCount = Customers.find({$or:[
      {FirstName: { $regex: Session.get('customersSearchFilter'), $options: 'i' }},
      {LastName: { $regex: Session.get('customersSearchFilter'), $options: 'i' }}
      ]
    }).count();
    Session.set('customersReceivedData', new Date());
    Session.set('customersPaginationCount', Math.floor((customersCount - 1) / Session.get('customersTableLimit')) + 1);
    return Customers.find({$or:[
      {FirstName: { $regex: Session.get('customersSearchFilter'), $options: 'i' }},
      {LastName: { $regex: Session.get('customersSearchFilter'), $options: 'i' }}
      ]
    },{limit: Session.get('customersTableLimit'), skip: Session.get('customersSkipCount')});
  },
  rendered: function(){
    $(this.find('#customersTable')).tablesorter();

    // Deps.autorun(function(){
    //   console.log(Session.get('customersReceivedData'));
    //   setTimeout(function(){
    //     $("#customersTable").trigger("update");
    //   }, 200);
    // });
  }
});





Template.customersListPage.events({
  'keyup #customersSearchInput':function(){
    Session.set('customersSearchFilter', $('#customersSearchInput').val());
    Session.setDefault('customersSelectedPagination', 0);
    Session.setDefault('customersSkipCount', 0);
  },
  'click #twentyButton':function(){
    Session.set('customersTableLimit', 20);
  },
  'click #fiftyButton': function(){
    Session.set('customersTableLimit', 50);
  },
  'click #hundredButton': function(){
    Session.set('customersTableLimit', 100);
  },
  'click .pagination-btn':function(){
    //alert(JSON.stringify(this.index));
    Session.set('customersSelectedPagination', this.index);
    Session.set('customersSkipCount', this.index * Session.get('customersTableLimit'));
  },
  'click .customerRow':function(){
    Session.set('selectedUser', this._id);
    Router.go('/customer/' + this._id);
    //alert(this._id);
  }
});


Template.customersListPage.helpers({
  getPaginationCount: function(){
    return Session.get('customersPaginationCount');
  },
  paginationButtonList: function(){
    var paginationArray = [];
    for (var i = 0; i < Session.get('customersPaginationCount'); i++) {
      paginationArray[i] = {
        index: i
      };
    }
    if(paginationArray.length > 1){
      return paginationArray;
    }else{
      return [];
    }
  },
  isTwentyActive: function(){
    if(Session.get('customersTableLimit') === 20){
      return "active";
    }
  },
  isFiftyActive: function(){
    if(Session.get('customersTableLimit') === 50){
      return "active";
    }
  },
  isHundredActive: function(){
    if(Session.get('customersTableLimit') === 100){
      return "active";
    }
  }
});



Template.paginationButton.helpers({
  pageActive: function(){
    if(this.index === Session.get('customersSelectedPagination')){
      return "active";
    }
  },
  getPage: function(){
    return this.index + 1;
  }
});
