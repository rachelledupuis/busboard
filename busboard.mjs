import fetch from 'node-fetch';
import readline from 'readline-sync';

/* fetch('https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18')
    .then(response => response.json())
    .then(body => console.log(body)); */

    //let postcode = 'NW51TL';

function getPostcodeFromUser() {
    console.log('Please enter your postcode:');
    return readline.prompt(); 
};

async function getCoordinates() {
    let longitude = 0;
    let latitude = 0;
    do {
        try {
            const postcode = getPostcodeFromUser();
            const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
            const coordinates = await response.json();
            longitude = coordinates.result.longitude;
            latitude = coordinates.result.latitude;
        }
        catch(err) {
            console.log('Invalid postcode.');
        }
    } while (longitude == 0 && latitude == 0);
return {longitude: longitude, latitude: latitude};
}

async function fetchStopCode(lat, long){
    let nearestTwoStations = [];
    let radius = 400;
        try {
            const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${long}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`);
            const searchResults = await response.json();
            searchResults.stopPoints.sort((dist1, dist2) => dist1.distance - dist2.distance);
            nearestTwoStations = searchResults.stopPoints.slice(0, 2);
            if (nearestTwoStations.length == 0) {
                throw 'No stops';
            }
        }
        catch(err) {
            console.log('There are no bus stops within 400m');
            throw err;
        }
return nearestTwoStations.map(station => station.id);
}

async function fetchBuses(stopCodes) {
    for (const stop of stopCodes) {
    const response = await fetch('https://api.tfl.gov.uk/StopPoint/' + stop + '/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18');
    const buses = await response.json();
    
    buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
    let firstFiveBuses = buses.slice(0, 5);

    console.log(`The next buses leaving from ${firstFiveBuses[0].stationName}:`);
   
    for (const bus of firstFiveBuses) {
        let minutes = Math.floor(bus.timeToStation / 60)
        console.log (`Bus ${bus.lineName} to ${bus.destinationName} is arriving in ${minutes} minutes.`)
    }
}
}

async function busBoard() {
    const coordinates = await getCoordinates();
    const stopCodes = await fetchStopCode(coordinates.latitude, coordinates.longitude);
    return fetchBuses(stopCodes); 
}

 busBoard();