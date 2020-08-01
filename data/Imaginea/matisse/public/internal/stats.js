/**
 * Show the active boards and users.
 */
define(
    function() {

        function showActiveBoards(boards) {
            $('#boards').empty();

            $(boards).each(
                function(bidx, board) {
                    var boardName = $('<a class="name"/>')
                        .text(board.name)
                        .attr('href', '/' + board.name); 
                    var usersDiv = $('<ul class="users"/>');
                    var boardDiv = $('<div class="board"/>')
                        .append(boardName)
                        .append(usersDiv);
                    $(board.users).each(
                        function(uidx, user) {
                            usersDiv.append($('<li/>').text(user));
                        }
                    );
                    $('#boards').append(boardDiv);
                });
        }

        function connect() {
            var sock = io.connect('http://' + location.host + '/god');
            sock.on('active-boards', showActiveBoards);
        }

        $(connect);
    });