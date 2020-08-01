//Adds a movie to Local Storage. If no user do nothing. Clicking again removes the entry from Local Storage
function AddToChart(id) {
    var currentUser = localStorage.getItem('currentUser');
    
    if (currentUser === null || currentUser === '') {
        return;
    }
    
    if (localStorage.getItem(currentUser + 'FilmInChart' + id) == null || localStorage.getItem(currentUser + 'FilmFilmInChart' + id) == '') {
        localStorage.setItem(currentUser + 'FilmInChart' + id, "true");
    } else {
        localStorage.removeItem(currentUser + 'FilmInChart' + id);
    }
}

//Populates Chart with Items which are preselected to buy. Shows or Hides Dropdown
$(document).ready(function() {
    $("#arrowChart").click(function() {

        var currentUser = localStorage.getItem('currentUser');

        //If no user is logged in just show default dropdown
        if (currentUser === null || currentUser === '') {
            if ($("#ChartDropDown").is(":hidden")) {
                $("div").slideDown("slow");
            } else {
                $("#ChartDropDown").slideUp("slow");
            }

            //If user is logged in load movies in chart into dropdown when dropping down. When dropping up remove those items from list but not from local stroage
        } else {
            if ($("#ChartDropDown").is(":hidden")) {
                for (var i = 0; i < movieList.Filme.length; i++) {
                    // Because we work with the movie id, wich is unique it is possible to add any movie in the databae, however our button logic does not support. to see results change Local Storage Value in Browser
                    if (localStorage.getItem(currentUser + 'FilmInChart' + movieList.Filme[i].id) === "true") {
                        $("#afterthis").after(AddInfo(i));
                    }
                }
                $("div").slideDown("slow");
            } else {    
                $("#ChartDropDown").slideUp("slow");
                $('.ChartContainer').remove();
            }
        }
    });
});

function AddInfo(index) {

    return "<div class='ChartContainer'>" + horizontalline + window.wrap + "<img src=" + window.movieList.Filme[index].picture + " />" + "</div>" +
        window.textWrap + "<p class='title'>" + window.movieList.Filme[index].titel +
        "</p><p class='price-info'>" + window.movieList.Filme[index].preis + " €</p>" +
        "<div class='correct-space'></div>" + "</div></div>";
}

$("#buyBtn0").click(function () {
    AddToChart(0);
});
$("#buyBtn1").click(function () {
    AddToChart(1);
});
$("#buyBtn2").click(function () {
    AddToChart(2);
});
$("#buyBtn3").click(function () {
    AddToChart(3);
});
$("#buyBtn4").click(function () {
    AddToChart(4);
});
$("#buyBtn5").click(function () {
    AddToChart(5);
});


