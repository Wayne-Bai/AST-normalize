(function() {

App.people.add([
    { id: 1, name: 'Barack Obama',    avatar: 'http://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Official_portrait_of_Barack_Obama.jpg/220px-Official_portrait_of_Barack_Obama.jpg' },
    { id: 2, name: 'David Cameron',   avatar: 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Official-photo-cameron.png/477px-Official-photo-cameron.png' },
    { id: 3, name: 'Angela Merkel',   avatar: 'http://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/AM_Juli_2010_-_3zu4.jpg/450px-AM_Juli_2010_-_3zu4.jpg' },
    { id: 4, name: 'Nicolas Sarkozy', avatar: 'http://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Flickr_-_europeanpeoplesparty_-_EPP_Summit_October_2010_%28105%29.jpg/391px-Flickr_-_europeanpeoplesparty_-_EPP_Summit_October_2010_%28105%29.jpg' },
    { id: 5, name: 'Vladimir Putin',  avatar: 'http://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Vladimir_Putin_official_portrait.jpg/468px-Vladimir_Putin_official_portrait.jpg' },
    { id: 6, name: 'Yoshihiko Noda',  avatar: 'http://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Yoshihiko_Noda-3.jpg/443px-Yoshihiko_Noda-3.jpg' },
    { id: 7, name: 'Janez Jansa',     avatar: 'http://beta.finance-on.net/galerije/172/jansa_janez3_ih.jpg' },
    { id: 8, name: 'Zoran Jankovic',  avatar: 'http://www.radioaktual.si/uploads/jankovic1.jpg' }
]);

App.activities.add([
    { id: 1, name: 'Coffee in Sierra Nevada', createdAt: moment('04-07-2011', 'D-M-YYYY').valueOf() },
    { id: 2, name: 'European Summit lunch',   createdAt: moment('14-08-2011', 'D-M-YYYY').valueOf() },
    { id: 3, name: 'Bus ride to Paris',       createdAt: moment('09-09-2011', 'D-M-YYYY').valueOf() },
    { id: 4, name: 'Nova trenirka. Fuł.',     createdAt: moment('11-12-2011', 'D-M-YYYY').valueOf() }
]);

// Add coffee expenses for Sierra Nevada
var sierra = App.activities.get(1);
sierra.addPayment(App.people.get(1), App.people.get(1), 18.00);
sierra.addPayment(App.people.get(1), App.people.get(2),  8.00);
sierra.addPayment(App.people.get(1), App.people.get(4), 12.00);
sierra.addPayment(App.people.get(1), App.people.get(6),  6.00);

// Add Euro summit expenses
var summit = App.activities.get(2);
summit.addPayment(App.people.get(3), App.people.get(3),  42.00);
summit.addPayment(App.people.get(3), App.people.get(2),  87.00);
summit.addPayment(App.people.get(3), App.people.get(4), 120.00);
summit.addPayment(App.people.get(3), App.people.get(5),  94.00);

// Add bus ride
var bus = App.activities.get(3);
bus.addPayment(App.people.get(4), App.people.get(2), 8.73);
bus.addPayment(App.people.get(4), App.people.get(3), 8.73);
bus.addPayment(App.people.get(4), App.people.get(5), 8.73);

// Trenirka
var trenirka = App.activities.get(4);
trenirka.addPayment(App.people.get(8), App.people.get(7), 50.00);

})();