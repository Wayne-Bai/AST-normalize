var result;
$(document).ready(function () {

    $.ajax({
        type: "GET",
        url: "../LocalStorage/LocalStorage/json_Filme/json_Filme.json",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: OnSuccess,
    });

    function OnSuccess(results) {
        result = results;

        var currentUser = localStorage.getItem('currentUser');

        if (currentUser == null || currentUser == '') {

            return;
        }

        //Get all Favorites
        for (var i = 0; i < result.Filme.length; i++) {
            if (localStorage.getItem(currentUser + 'Favorit' + i) === "true") {
                Add(i);
            }
        }
    }
});

//Some Inline code. Not beatiful but works
function Add(index) {
    $('.favorit-section').append(
        '<div class="profil-container">' +
            '<h2 class="profil-titel">' + result.Filme[index].titel + '</h2>' +
            '<img class="profil-img" src=' + result.Filme[index].picture + ' />' +
            '<p class="profil-desc"> ' + result.Filme[index].description + '</p>' +
            '<div>');
}
