//global variables
let currentClub; //last station touched
let clubs; //all the stations


let baseURL = "https://apiv2.apifootball.com/?action=get_countries";
//creates url
const createUrl = (baseUrls, params = {}) =>
    `${baseUrls}?${Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')}`;

const mapPlayerType = {
    "Goalkeepers":"GK",
    "Defenders":"DF",
    "Midfielders":"MF",
    "Forwards": "FW"
}
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
        // debugger;
        clubs = data;
        $.each(clubs, function (index, club) {
            // debugger;
            let team_name = club.team_name;
            let team_points = club.overall_league_PTS;
            // let team_badge = club.team_badge;
            // $('#clubList').append(`<li><a id = 'to_details' href='#'>${club.team_name}</a></li>`);
            let html = `<li ><a id='to_details' data-id='${index}'>${team_name}<span class="ui-li-count">${team_points}</span></a></li>`;
            $('#clubList').append(html);
        });
        $('#clubList').listview('refresh');
        $.mobile.loading("hide");
    });
});

$(document).on('pagebeforeshow', '#detailsPage', () => {
    console.log("before showing details page");
    $.mobile.loading("show");
    debugger;
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
            $('#players').empty()
            $.each(players, function (index, player) {
                debugger;
                let playerName = player.player_name;
                let jerseyNumber = player.player_number;
                // let team_badge = club.team_badge;
                // $('#clubList').append(`<li><a id = 'to_details' href='#'>${club.team_name}</a></li>`);
                let html = `<li ><a data-id='${index}'>${playerName} (${mapPlayerType[player.player_type]})<span class="ui-li-count">${jerseyNumber}</span></a></li>`;
                $('#players').append(html);
                $('#players').listview('refresh');
            });
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