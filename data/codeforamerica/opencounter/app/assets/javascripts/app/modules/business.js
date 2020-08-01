define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Business = app.module();

  // Default model.
  Business.Model = Backbone.Model.extend({
    name: "business"
  });

  Business.TypeModel = Backbone.Model.extend({
    name: "typemodel"
  });

  Business.Views.License = Backbone.View.extend({
    template: "panels/requirements/city/business_license",
    calculate:function(){
      var employees = this.$el.find("input[name=employee_count]").val();
      var base_tax = 145.15,
      employee_rate = 1,
      total = 0,
      business_class = this.collection.getAnswer('CIC_classification', '');

      switch(business_class) {
      case 'A':
        employee_rate = 2.55;
        break;
      case 'B':
        employee_rate = 4.95;
        break;
      case 'C':
        employee_rate = 7.40;
        break;
      }
       
      // Formula from http://www.cityofsantacruz.com/index.aspx?page=764
      total = base_tax + (employee_rate * employees);

      // Round to nearest cent
      total = Math.round(100 * total) / 100;
      this.collection.addAnswer("business_license_fee", total);
      this.$el.find('#business_license_fee').html("$"+total);

    },
    subviews:function(){
      //This looks for a typeahead connect with api for results
      return {
        afterRender: function(){
          var self = this;
          this.$el.find('input[name=employee_count]').change(function(){self.calculate.call(self)});
        },
        beforeRender: function(){}
      }

    }    
    
  })

  Business.Views.Info = Backbone.View.extend({
    template: "panels/info/business",
    getCIC:function(query, process){
      var self = this.options.self;
      $.ajax("/api/lookup/cic.json",{data:{q:query}, success:function(data){
        self.cicData = data;
        var list = [];
        for(d in data){
          list.push(data[d].industry_subindustry);
        }
        process(list);
      }}, "json");

    },
    saveCICValues:function(text, data){
      var found = false
      for(d in data){
        if(text == data[d].industry_subindustry){
          for(key in data[d]){
            this.collection.addAnswer("CIC_"+key, data[d][key], {silent:true});
          }
          found = true;
          app.trigger("lookup_requirements");
        }
      }
      app.trigger("lookuppermit");
      return found;
    },
    subviews:function(){
      return {
        afterRender: function(){
          var self = this;

          // --- TypeAhead For Business Type ---
          var typeaheadel = this.$el.find(".typeahead");
          if (typeaheadel.length > 0) {
            // TODO check for type of typeahead, for now just CIC
            $(typeaheadel).change(function(ev){
              if(self.saveCICValues($(ev.target).val(), self.cicData)){
                $(ev.target).addClass("invalid");
              } else {
                $(ev.target).removeClass("invalid");
              }
            });
            $(typeaheadel).typeahead({source:this.getCIC, items:10, matcher:function(){return true;}, self:self});
          }
          
          // --- Sole Owner / Co-Owner Toggle ---
          
          var isSoleOwnerEl = this.$el.find('input[name="applicant_is_sole_owner"]'),
              isSoleOwner = (isSoleOwnerEl.attr('checked') && isSoleOwnerEl.attr('checked') === 'checked') ? true : false,
              coOwnersEl = this.$el.find(".co-owners");
          
          // If sole owner, hide co-owner fields
          if (isSoleOwner) {
              coOwnersEl.hide();
          }
          
          // On change, toggle co-owner fields
          isSoleOwnerEl.change(function(e) {
              
              isSoleOwner = (isSoleOwnerEl.attr('checked') && isSoleOwnerEl.attr('checked') === 'checked') ? true : false;
              
              if (isSoleOwner) {
                  coOwnersEl.hide();
              } else {
                  coOwnersEl.show();
              }
          });
          
        },
        beforeRender: function(){}
      }

    }    

  });

  // Return the module for AMD compliance.
  return Business;

});
