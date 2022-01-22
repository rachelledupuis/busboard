import fetch from 'node-fetch';
import readline from 'readline-sync';

//fetch is an asynchronous function
/* fetch('https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18')
    .then(response => response.json())
    .then(body => console.log(body)); */

//get post code from user
console.log('Please enter your post code');
const postcode = readline.prompt();

//let postcode = 'NW51TL';

async function getCoordinates(postcode) {
    const response1 = await fetch(`https://api.postcodes.io/postcodes/ ${postcode}`);
    const coordinates = await response1.json();

    let longitude = coordinates.result.longitude;
    let latitude = coordinates.result.latitude;

    return {longitude: longitude, latitude: latitude};
}

let coordinates = await getCoordinates(postcode);

async function fetchStopCode(lat, long){

    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${long}&stopTypes=NaptanPublicBusCoachTram&radius=400`);
    const searchResults = await response.json();
 
    searchResults.stopPoints.sort((dist1, dist2) => dist1.distance - dist2.distance);
    let nearestTwoStations = searchResults.stopPoints.slice(0, 2);

    return nearestTwoStations.map(station => station.id);
}
    
let stopCodes = await fetchStopCode(coordinates.latitude, coordinates.longitude);
console.log(stopCodes);

async function fetchBuses() {
    for (const stop of stopCodes) {
    const response = await fetch('https://api.tfl.gov.uk/StopPoint/' + stop + '/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18');
    const buses = await response.json();
    
    buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
    let firstFiveBuses = buses.slice(0, 5);
   
    for (const bus of firstFiveBuses) {
        let minutes = Math.floor(bus.timeToStation / 60)
        console.log (`Bus ${bus.lineName} to ${bus.destinationName} is arriving in ${minutes} minutes.`)
    }
}
}

await fetchBuses(stopCodes);