//global variables
let currentClub;
let clubs;
let players;
let currentPlayer


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

const getClubsUrl = createUrl('https://apiv2.apifootball.com', {
    action: 'get_standings',
    league_id: 148,
    APIkey: footballApiKey
});

const getClubs = () => {
    return new Promise(function (resolve) {
        $.ajax({
            url: getClubsUrl,
            success: function (data) {
                resolve(data);
            }
        });
    })
}

const populateClubs = (clubData, whichDiv) => {
    $.each(clubData, function (index, club) {
        //show in html
        let team_name = club.team_name;
        let team_points = club.overall_league_PTS;
        let team_id = club.team_id;
        let team_badge = club.allDetails[0].team_badge;

        $(whichDiv).append(`<li id='to_details'><a data-id='${index}'>
            <img class ='clubIcon' src='${team_badge}' alt='${team_name}' class="ui-li-icon ui-corner-none">
            ${team_name}<span class="ui-li-count">${team_points}</span></a></li>`);
        $(whichDiv).listview('refresh');
    });
}


const populateDetails = (cClub) => {

    return new Promise(function (resolve) {

        players = cClub.allDetails[0].players;

        let html = '';
        $.each(players, function (index, player) {
            let playerId = player.player_key;
            let playerName = player.player_name;
            let jerseyNumber = player.player_number;
            // let team_badge = club.team_badge;

            html += `<li class='playersInd'>
            <a href="#popupBasic" data-rel='popup' data-transition="pop" data-id='${index}'>
            ${playerName} (${mapPlayerType[player.player_type]})
            <span class="ui-li-count">${jerseyNumber}</span></a></li>`;
            // $(where).listview('refresh');
        });
        resolve(html);
    });
}

const getDetails = (club) => {
    return new Promise(function (resolve) {
        let getDetails = createUrl('https://apiv2.apifootball.com', {
            action: 'get_teams',
            APIkey: footballApiKey,
            team_id: club.team_id
        });
        $.ajax({
            url: getDetails,
            success: function (data) {
                club.allDetails = data;
                resolve();
            }
        });
    });
}

const getCountryFlag = (countryName) =>{
    return new Promise(function resolve(){
        countryName = countryName.replace(/\s+/g, '-');
        if (countryName == 'Northern-Ireland'){
            countryName = 'England';
        }
        else if (countryName == 'Ivory-Coast'){
            countryName = 'Cote-dIvoire';
        }
        img = `<img src='https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/flat/64/${countryName}.png' class="photo">`;
        resolve(img);
    });
}

const createPopupHTML = (currentPlayer) => {

    return new Promise(function (resolve) {
        let playerId = currentPlayer.player_key;
        let playerName = currentPlayer.player_name;
        let playerAge = currentPlayer.player_age;
        let playerType = currentPlayer.player_type;
        let playerCountry = currentPlayer.player_country;
        // let imageUrl = mapBackground[playerType];
        let matchesPlayed = currentPlayer.player_match_played;
        let playerGoals = currentPlayer.player_goals;
        let playerYellowCard = currentPlayer.player_yellow_cards;
        let playerRedCard = currentPlayer.player_red_cards;

        // let playerAge = currentPlayer.player_age
        closebtn = '<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>';

        header = `<div><h2>${playerName} (${mapPlayerType[playerType]}) </h2></div>`;

        getCountryFlag(playerCountry).then(function(resolve){
            img = resolve
        })
        
        popup = `<div data-role="popup" id="popup-${playerId}" data-short="${playerId}" data-theme="none" data-overlay-theme="b" data-corners="false" data-tolerance="15"></div>`;
        playersDetails = `<div><h3>Playing Position: ${playerType}</h3>
                        <h3>Age: ${playerAge}</h3></div>
                        <table class="greyGridTable"><thead><tr><th>Statistics</th><th>Value</th></tr></thead>
                        <tbody><tr><td>Matches Played</td><td>${matchesPlayed}</td></tr>
                            <tr><td>Goal Scored</td><td>${playerGoals}</td></tr>
                            <tr><td>Yellow Cards</td><td>${playerYellowCard}</td></tr>
                            <tr></tr><td>Red Cards</td><td>${playerRedCard}</td></tr
                        </tbody></table>`;
        $(header).appendTo($(popup)
                .appendTo($.mobile.activePage)
                .popup())
            .after(playersDetails)
        .after(img);

        $("#popup-" + playerId).popup("open");
        
        $(document).on("popupafterclose", ".ui-popup", function () {
            $(this).remove();
        });

        resolve(true);
    })
}


const attachEvent = (classA) => {
    return new Promise(function (resolve) {

        $(classA).on('click', function (event) {

            let playerIndex = event.target.getAttribute("data-id");

            currentPlayer = players[playerIndex];

            let popUpadded;

            createPopupHTML(currentPlayer).then(function (resolve) {
                popUpadded = resolve;
            })

            if (popUpadded == true) {
                resolve();
            }

        });
    })
}

$(document).on('click', '#to_details', function (e) {
    $.mobile.loading("show");

    e.preventDefault();

    e.stopImmediatePropagation();

    $('#players').empty();

    let clubIndex = e.target.getAttribute("data-id");

    currentClub = clubs[clubIndex];

    populateDetails(currentClub).then(function (result) {
        $('#players').append(result);
        $('#players').listview('refresh');
        //now attach teh listeners
        attachEvent('.playersInd');

    });

    // $('#players').listview('refresh');

    $.mobile.changePage("#detailsPage", {
        transition: 'slide'
    });

    $.mobile.loading("hide");

});


//onclick of refresh button

$(document).on("click", "#refresh", async function (event) {

    event.preventDefault();

    $("#clubList").empty();

    $.mobile.loading("show");

    clubs = await getClubs();

    let promisesAll = clubs.map(club => getDetails(club));

    await Promise.all(promisesAll);

    populateClubs(clubs, '#clubList');

    $.mobile.loading("hide");

});
