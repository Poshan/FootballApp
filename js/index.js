//global variables
let currentClub; //last station touched
let clubs; //all the stations


let baseURL = "https://apiv2.apifootball.com/?action=get_countries";
//creates url
const createUrl = (baseUrls, params = {}) =>
    `${baseUrls}?${Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')}`;

const mapPlayerType = {
    "Goalkeepers": "GK",
    "Defenders": "DF",
    "Midfielders": "MF",
    "Forwards": "FW"
};


//onclick of refresh button
$(document).on("click", "#refresh", event => {
    event.preventDefault();
    $.mobile.loading("show");
    //using the ip location
    let access_key = '18d7766cdddd4e41af24b356f41f7bb3';
    let lat, lng;

    const requestUrl = createUrl('https://apiv2.apifootball.com', {
        action: 'get_standings',
        league_id: 148,
        APIkey: footballApiKey
    });
    // debugger;

    $.getJSON(requestUrl, data => {
        clubs = data;
        $("#clubList").empty();
        $.each(clubs, function (index, club) {
            // debugger;
            let team_name = club.team_name;
            let team_points = club.overall_league_PTS;
            let team_id = club.team_id;
            // $('#clubList').append(`<li><a id = 'to_details' href='#'>${club.team_name}</a></li>`);
            let getTeamBadge = createUrl('https://apiv2.apifootball.com', {
                action: 'get_teams',
                APIkey: footballApiKey,
                team_id: team_id
            });
            let team_badge = '';
            $.ajax({
                url: getTeamBadge,
                dataType: "json",
                success: function (data) {
                    team_badge = data[0].team_badge;
                    let html = `<li id='to_details'><a data-id='${index}'><img class ='clubIcon' src='${team_badge}' alt='${team_name}' class="ui-li-icon ui-corner-none">${team_name}<span class="ui-li-count">${team_points}</span></a></li>`;
                    $('#clubList').append(html);
                    $('#clubList').listview('refresh');
                }
            });

        });
        $('#clubList').listview('refresh');
        $.mobile.loading("hide");
    });
});



$(document).on('pagebeforeshow', '#detailsPage', function () {
    $.mobile.loading("show");
    // debugger;
    $('#clubName').text(currentClub.team_name);
    let id_currentClub = currentClub.team_id;
    let getPlayersURL = createUrl('https://apiv2.apifootball.com', {
        action: 'get_teams',
        APIkey: footballApiKey,
        team_id: id_currentClub
    });
    console.log(getPlayersURL);
    $.ajax({
        url: getPlayersURL,
        dataType: "json",
        success: function (data) {
            $.mobile.loading("show");
            let players = data[0].players;
            let iconURL = data[0].team_badge;
            // debugger;
            $("#clubIcon").attr({
                "src": iconURL
            });
            $('#players').empty();
            $.each(players, function (index, player) {
                let playerId = player.player_key;
                let playerName = player.player_name;
                let jerseyNumber = player.player_number;
                // let team_badge = club.team_badge;
                // $('#clubList').append(`<li><a id = 'to_details' href='#'>${club.team_name}</a></li>`);
                let html = `<li class='playersInd'>
                    <a href="#popupBasic" data-rel='popup' data-transition="pop" data-id='${playerId}'>${playerName} (${mapPlayerType[player.player_type]})
                        <span class="ui-li-count">${jerseyNumber}</span>
                    </a>
                    </li>`;
                $('#players').append(html);


            });
            $('.playersInd').on('click', function () {
                //get player detail and show in the popup
                let playerId = this.children[0].getAttribute("data-id");
                let getPlayerStat = createUrl('https://apiv2.apifootball.com', {
                    action: 'get_players',
                    APIkey: footballApiKey,
                    player_id: playerId
                });
                $.ajax({
                    url: getPlayerStat,
                    dataType: "json",
                    success: function (data) {
                        // debugger;
                        let playerId = data[0].player_key;
                        let playerName = data[0].player_name;
                        let playerAge = data[0].player_age;
                        let playerType = data[0].player_type;
                        let playerCountry = data[0].player_country;
                        // let playerAge = data[0].player_age
                        closebtn = '<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>';
                        header = `<div data-role="header"><h2>${playerName} (${mapPlayerType[playerType]}) </h2></div>`;
                        img = `<img src='https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/flat/64/${playerCountry}.png' class="photo">`;
                        popup = `<div data-role="popup" id="popup-${playerId}" data-short="${playerId}" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15">
                        </div>`;
                        playersDetails = `<h2>${playerName}</h2>
                        <h3></h3>`
                        $(header).appendTo($(popup)
                                .appendTo($.mobile.activePage)
                                .popup())
                            .toolbar().after(playersDetails)
                        .after(img);

                        $(".photo", "#popup-" + playerId).load(function () {
                            // Open the popup
                            $("#popup-" + playerId).popup("open");
                            // Clear the fallback
                            clearTimeout(fallback);
                        });
                        var fallback = setTimeout(function () {
                            $("#popup-" + playerId).popup("open");
                        }, 2000);
                        $(document).on("popupafterclose", ".ui-popup", function () {
                            $(this).remove();
                        });
                    }
                });
            });
            $('#players').listview('refresh');
            $.mobile.loading("hide");
        }
    });
});
//navigation to details event
$(document).on('pagebeforeshow', '#page1', function () {
    $(document).on('click', '#to_details', function (e) {
        console.log("on click");
        $.mobile.loading("show");
        //not doing the defualt things
        e.preventDefault();
        e.stopImmediatePropagation();
        // debugger;
        //get the team
        let clubIndex = e.target.getAttribute("data-id");
        currentClub = clubs[clubIndex];
        // currentClub = clubs[e.target.children[1].id];
        //change to the details page
        $.mobile.changePage("#detailsPage", {
            transition: 'slide'
        });
        $.mobile.loading("hide");

        //
    });

});