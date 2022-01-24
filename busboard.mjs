import fetch from 'node-fetch';
import readline from 'readline-sync';
import winston from 'winston';
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

/* fetch('https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18')
    .then(response => response.json())
    .then(body => console.log(body)); */

function getUserInput(prompt) {
    console.log(prompt);
    return readline.prompt(); 
};

async function getCoordinates() {
    let postcode;
    let longitude = 0;
    let latitude = 0;
    do {
        try {
            postcode = getUserInput('Please enter your postcode');
            const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
            const coordinates = await response.json();
            longitude = coordinates.result.longitude;
            latitude = coordinates.result.latitude;
        }
        catch(err) {
            logger.info(`User entered ${postcode} as postcode`);
            console.log('Invalid postcode.');
        }
    } while (longitude == 0 && latitude == 0);
return {longitude: longitude, latitude: latitude, postcode};
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

let firstFiveBuses;

async function fetchBuses(stopCodes) {
    try {
        for (const stop of stopCodes) {
            const response = await fetch('https://api.tfl.gov.uk/StopPoint/' + stop + '/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18');
            const buses = await response.json();

            if (buses.length === 0) {
                throw 'No buses';
            }
            
            buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
            firstFiveBuses = buses.slice(0, 5);

            console.log(`The next buses leaving from ${firstFiveBuses[0].stationName}:`);
    
            for (const bus of firstFiveBuses) {
                let minutes = Math.floor(bus.timeToStation / 60)
                console.log (`Bus ${bus.lineName} to ${bus.destinationName} is arriving in ${minutes} minutes.`)
            }
        }
    }
    catch(err) {
        console.log('There are no buses scheduled to arrive at your two nearest stops.')
        throw err;
    }
}

async function getDirections(from, to) {
    let userWantsDirections;
    do {
        userWantsDirections = getUserInput('Would you like directions to these stops? Enter Y or N');
    } while (userWantsDirections !== 'Y' && userWantsDirections !== 'N');
    if (userWantsDirections == 'N') {
        return console.log('Have a nice trip')
    }

    for (const stopCode of to) {
        const response = await fetch (`https://api.tfl.gov.uk/Journey/JourneyResults/${from}/to/${stopCode}`);
        const journeyPlan = await response.json();
        const turnDirection = journeyPlan.journeys[0].legs[0].instruction.steps;
    
        for (const direction of turnDirection) {
            console.log(`${direction.descriptionHeading} ${direction.description}`);
        }
    }
}

async function busBoard() {
    const coordinates = await getCoordinates();
    const stopCodes = await fetchStopCode(coordinates.latitude, coordinates.longitude);
    await fetchBuses(stopCodes);
    return await getDirections(coordinates.postcode, stopCodes);
}

 busBoard();

 /*
POTENTIAL ISSUES
-Nearest stop(s) is out of service - program should re-reun to find next closest stops that are in service ex: IG11 0FU
-No stops within default radius - allow user to choose/increase radius
-No buses coming to nearest stop - program should re-run
*/