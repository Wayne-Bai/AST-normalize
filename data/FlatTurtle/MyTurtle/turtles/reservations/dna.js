(function($) {

    /*
     * Collections are ordered sets of models. You can bind "change" events to
     * be notified when any model in the collection has been modified, listen
     * for "add" and "remove" events, fetch the collection from the server
     */
    var collection = Backbone.Collection.extend({
        initialize : function(models, options) {
            _.bindAll(this, "configure", "url", "parse", "refresh", "getLogo");

            this.bind("born", this.fetch);
            this.on("born", this.configure);
            this.on("reconfigure", this.configure);

            var self = this;

            setTimeout(function(){
                setInterval(self.refresh, 30000);
            },  Math.round(Math.random()*5000));
        },
        configure : function(){
            //get companies
            var url = this.options.url;
            url = url.replace(url.substr(url.lastIndexOf('/things')), '');
            url += "/companies";

            $.ajax({
                url: url,
                async: false,
                dataType: 'json',
                success: function(data) {
                    companies = data;
                }
            });
            this.companies = companies;
        },
        url: function(){
            var url = this.options.url;

            return url + "/reservations";
        },
        parse: function(json){
            if(json.length > 0){
                var date_now = new Date();
                var futureReservations = [];

                for(var i in json){
                    var reservation = json[i];
                    var from = dateFromString(reservation.to);
                    console.log(from.toDateString());
                    console.log(date_now.toDateString());
                    console.log(from>date_now);
                    if(from > date_now && parseInt(reservation.activated)){
                        futureReservations.push(reservation);
                    }
                }

                console.log(futureReservations);
                // sort the reservations on time
                futureReservations.sort(function(a,b){
                    a_date = dateFromString(a.from);
                    b_date = dateFromString(b.from);
                    if (a_date < b_date) return -1;
                    if (a_date > b_date) return 1;

                    // this should never happen!
                    return 0;
                });

                var now = null;
                var next = null;
                if(futureReservations.length> 0){
                    now = futureReservations[0];

                    now.logo = this.getLogo(now.customer.company);

                    if(now.comment.toLowerCase() == "no comment"){
                        now.comment = "";
                    }
                    now.from = dateFromString(now.from);
                    now.from_string = now.from.format("{H}:{M}");
                    now.to = dateFromString(now.to);
                    now.to_string = now.to.format("{H}:{M}");
                    now.booker = now.announce.join(", ");
                    if(futureReservations.length > 1){
                        next = futureReservations[1];

                        next.logo = this.getLogo(next.customer.company);

                        if(next.comment.toLowerCase() == "no comment"){
                            next.comment = "";
                        }
                        next.from = dateFromString(next.from);
                        next.from_string = next.from.format("{H}:{M}");
                        next.to = dateFromString(next.to);
                        next.to_string = next.to.format("{H}:{M}");
                        next.booker = next.announce.join(", ");
                    }


                }
                this.options.now = now;
                this.options.next = next;
            }
            this.trigger('render');
        },
        refresh: function(){
            var self = this;
            self.fetch();
        },
        getLogo: function(comp){
            for(var index in this.companies){
                var company = this.companies[index];
                if(company.name == comp){
                    return company.logo_url;
                }
            }

            //Fallback image when the company is not found
            return "https://img.flatturtle.com/reservation/no-logo.png";
        }

    });

    var view = Backbone.View.extend({
        initialize : function(options) {

            // prevents loss of "this" inside methods
            _.bindAll(this, "render");

            // bind render to collection reset
            this.collection.on("reset", this.render);

            // pre-fetch template file and render when ready
            var self = this;
            if (this.template == null) {
                $.get("turtles/reservations/views/fullscreen.html", function(template) {
                    self.template = template;
                    self.render();
                });
            }

        },
        render : function() {

            // only render when template file is loaded
            if (this.template) {
                var now = this.options.now;
                var next = this.options.next;

                var data = {
                    now : now,
                    next : next
                };

                // add html to container
                this.$el.empty();
                this.$el.html(Mustache.render(this.template, data));

                if(now){
                    // progress
                    progressBar(this.$el, now.from, now.to);
                }
            }

        }
    });

    // animate the progressbar on the current meeting
    function progressBar($el, min_date, max_date){
        var currentDate = new Date();

        //don't start if current is smaller than min_date
        if(currentDate < min_date){
            //todo set timeout to start it when it has to (or just refresh)
            return;
        }

        var current_pct = (currentDate - min_date) / (max_date - min_date);
        var time_to_go =  max_date - currentDate;

        //only update every 5 seconds
        jQuery.fx.interval = 5000;

        $el.find(".progress").stop().width(current_pct*100+"%");
        $el.find(".progress").animate({width:"100%"}, parseInt(time_to_go), "linear", function() {

        })
    }

    // creating date from string, only chrome supports this directly in the constructor
    function dateFromString(d){
        return new Date(d.substr(0, 4), d.substr(5, 2) - 1, d.substr(8, 2), d.substr(11, 2), d.substr(14, 2), d.substr(17, 2));
    }

    // register turtle
    Turtles.register("reservations", {
        collection : collection,
        view : view
    });

})(jQuery);