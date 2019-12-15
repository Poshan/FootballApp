//global variables
let currentClub;
let clubs;
let players;
let currentPlayer;

let geojsonHeader = {
    "type": "FeatureCollection",
    "features": []
};

//openlayers imports




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

const mapBackgroundColor = {
    'Arsenal': '#f00001',
    'Aston Villa': '#660032',
    'Bournemouth': '#d71a21',
    'Brighton': '#0054a5',
    'Burnley': '#5d1523',
    'Chelsea': '#0a4595',
    'Crystal Palace': '#1a5da3',
    'Everton': '#254786',
    'Leicester': '#0a56a4',
    'Liverpool': '#e31c23',
    'Manchester City': '#99c5ea',
    'Manchester Utd': '#d20222',
    'Newcastle': '#000000',
    'Norwich': '#fef200',
    'Sheffield Utd': '#c5060b',
    'Southampton': '#951217',
    'Tottenham': '#0b0e1f',
    'Watford': '#fbee24',
    'West Ham': '#66192d',
    'Wolves': '#fcb913'
}
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
            ${team_name}<span class="ui-li-count">${index+1}
            </span><span class="ui-li-count">${team_points}</span></span></li>`);
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

const resolveCountryName = (cName) => {
    countryName = cName.replace(/\s+/g, '-');
    if (countryName == 'Northern-Ireland') {
        countryName = 'England';
    } else if (countryName == 'Ivory-Coast') {
        countryName = 'Cote-dIvoire';
    }
    return countryName;
}

const getCountryFlag = (cName) => {
    return new Promise((resolve) => {
        countryName = resolveCountryName(cName);
        img = `<img src='https://raw.githubusercontent.com/gosquared/flags/master/flags/flags/flat/64/${countryName}.png' class="photo">`;
        resolve(img);
    });
}

const createPopupHTML = (currentPlayer) => {

    return new Promise((resolve) => {
        // console.log(currentPlayer);
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

        header = `<div><h2 style ='background-color:${mapBackgroundColor[currentClub.team_name]};'>${playerName} (${mapPlayerType[playerType]}) </h2></div>`;

        getCountryFlag(playerCountry).then(function (result) {
            img = result;
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
            resolve();
        })
    })
}


const attachEvent = (classA) => {
    return new Promise(function (resolve) {

        $(classA).on('click', function (event) {

            let playerIndex = event.target.getAttribute("data-id");

            currentPlayer = players[playerIndex];

            createPopupHTML(currentPlayer).then(() => {
                resolve();
            })
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

        //now attach the listeners
        attachEvent('.playersInd');
    });

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

function getMap() {
    if ($('.ol-viewport').length != 0) {
        $('.ol-viewport').remove();
    }
    let map = new ol.Map({
        target: 'map',
        view: new ol.View({
            projection: 'EPSG:4326',
            center: [15.41, 8.82],
            zoom: 1
        })
    });

    const OSMStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true,
        title: 'OSMStandard'
    });

    const stamenTerrain = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
            attributions: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
        }),
        visible: false,
        title: 'StamenTerrain'
    });

    //layerGroup
    const baseLayerGroup = new ol.layer.Group({
        layers: [OSMStandard, stamenTerrain]
    })
    map.addLayer(baseLayerGroup);

    //Layer switcher
    const baseLayerElements = document.querySelectorAll('input[type = radio]');

    baseLayerElements.forEach(baseLayerElement => {
        $(baseLayerElement).on('change', function () {
            let baseLayerElementValue = this.value;
            baseLayerGroup.getLayers().forEach(function (element, index, array) {
                let baseLayerTitle = element.get('title');
                element.setVisible(baseLayerTitle === baseLayerElementValue);
            })
        })
    });

    map.updateSize();

    return map;
}


$(document).on("click", "#mapBtn", function (event) {

    $.mobile.changePage("#mapPage", {
        transition: 'slide'
    });
    // console.log(currentClub);
});

const getCountries = (player) => {
    return new Promise(function (resolve) {
        let country = resolveCountryName(player.player_country);

        //solving some exceptions of the countries rest api
        if (country == 'England' || country == 'Scotland' || country == 'Wales') {
            country = 'uk';
        }
        if (country == 'South-Korea') {
            country = 'Korea (Republic of)';
        }
        if (country == 'Cote-dIvoire') {
            country = `Côte d'Ivoire`;
        }
        if (country == 'Bosnia-and-Herzegovina') {
            country = `Bosnia and Herzegovina`;
        }
        if (country == 'Czech-Republic') {
            country = `Czech Republic`;
        }
        if (country == 'New-Zealand') {
            country = `New Zealand`;
        }
        if (country == 'Iran') {
            country = `Iran (Islamic Republic of)`;
        }
        if (country == 'DR-Congo') {
            country = `Congo (Democratic Republic of the)`;
        }

        let getLocation = `https://restcountries.eu/rest/v2/name/${encodeURIComponent(country)}?fullText=true`;
        $.ajax({
            url: getLocation,
            success: function (data) {
                // console.log(data);
                player.locationData = data;
                resolve();
            }
        });
    })
}

const getPlayersLayer = (player) => {

    return new Promise(function (resolve) {
        let coordinates = [player.locationData[0].latlng[1], player.locationData[0].latlng[0]];

        let country = player.player_country;
        let region = player.locationData[0].region;

        geojsonHeader.features.push({
            "type": "Feature",
            "properties": {
                "country": country,
                "Region": region
            },
            "geometry": {
                "type": "Point",
                "coordinates": coordinates
            }
        });
        resolve();
    })
}

//point styles
const pointStyle = new ol.style.Circle({
    fill: new ol.style.Fill({
        color: [245, 49, 5, 1]
    }),
    radius: 5
});

const countRegions = (geojsonH) => {
    //count the regions and send back in the 
    let regionArray = [];
    geojsonH.features.forEach(indPlayer => {
        regionArray.push(indPlayer.properties.Region);
    });

    let regionCount =[];

    //counting the number of regions
    setOcc = new Set(regionArray)
    arrOcc = [...setOcc]
    arrNumberOcc = arrOcc.map(occ => regionArray.filter(e => e === occ).length);
    for (let i =0; i< arrOcc.length; i++){
        regionCount.push({
            'Region': arrOcc[i],
            'Count': arrNumberOcc[i] 
        })
    }
    return regionCount;
}

const charts = (players) => {
    console.log(`the current club is ${geojsonHeader}`);
    let regionCount = countRegions(geojsonHeader);
    console.log(regionCount);
}

$(document).on('pageshow', '#mapPage', async function () {
    //checking if any map is already there!!! if yes remove it
    let mapOL = getMap();
    // console.log(currentClub);
    // debugger;
    let players = currentClub.allDetails[0].players;
    // console.log(players);

    let promisesAll = players.map(player => getCountries(player));

    await Promise.all(promisesAll);

    geojsonHeader.features = [];

    let geojsonPlayersPromise = players.map(player => getPlayersLayer(player));

    console.log(geojsonHeader);
    await Promise.all(geojsonPlayersPromise);

    //add the geojsonHeader to map
    let vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojsonHeader)
    });

    let playersLocation = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            image: pointStyle
        })
    });
    //fitting the extent of the geojson layer
    let extent = vectorSource.getExtent();

    //fit the map to the extent
    mapOL.getView().fit(extent, mapOL.getSize());

    mapOL.addLayer(playersLocation);

    //charts to show
    charts(players);


})