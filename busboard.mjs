import fetch from 'node-fetch';
import readline from 'readline-sync';
import winston from 'winston';
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});


const getPostCode = ()=>{ 
    console.log('Please enter your post code in the format - NW51TL:');
    let responsePostCode = readline.prompt();
    logger.warn(`You entered ${responsePostCode}`);
    return responsePostCode;
}


async function getCoordinates() {

    let longitude = 0;
    let latitude = 0;
    while (longitude == 0 && latitude == 0){
        try 
        {
            const postcode = getPostCode();
            const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
            const coordinates = await response.json();
            longitude = coordinates.result.longitude;
            latitude = coordinates.result.latitude;
        }
        catch(err) {
            logger.error(`Invalid postcode.`);
        }
    } 
return {longitude: longitude, latitude: latitude};
}

logger.info("***************New Instance*****************");
const coordinates = await getCoordinates();


async function fetchStopCode(lat, long){
    let nearestTwoStations = [];
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${long}&stopTypes=NaptanPublicBusCoachTram&radius=1000`);
        const searchResults = await response.json();
        searchResults.stopPoints.sort((dist1, dist2) => dist1.distance - dist2.distance);
        nearestTwoStations = searchResults.stopPoints.slice(0, 2);
        if (nearestTwoStations.length === 0){
            throw 'No stops';
        }
    }
     catch(err){
        logger.info("No bus stops found nearby");
        throw err;
    }
    
        return nearestTwoStations.map(station => station.id);
}

const stopCodes = await fetchStopCode(coordinates.latitude, coordinates.longitude);
// console.log(stopCodes);



async function fetchBuses(stopcodes) {
   try{ 
  for (const stop of stopcodes)
    {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stop}/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18`);
        const buses = await response.json();
        
   
    if (buses.length === 0) {
        throw 'No buses arriving.'
        
      
    }
    buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
    let firstFiveBuses = buses.slice(0, 5);
    logger.info(`Bus Arrivals at ${firstFiveBuses[0].stationName}:`);
   
    for (const bus of firstFiveBuses) {
        let minutes = Math.floor(bus.timeToStation / 60)
        logger.info(`Bus ${bus.lineName} to ${bus.destinationName} is arriving in ${minutes} minutes.`)
    }
        
    }
} catch(err){
    logger.info(`No bus arrivals currently scheduled at this stop.`)
    throw err;
}
 
}

await fetchBuses(stopCodes); 


async function getDirections (){
    let from = "HA29PP";
    let to = "NW51TL";
const response = await fetch (`https://api.tfl.gov.uk/Journey/JourneyResults/${from}/to/${to}`);
const journeyPlan = await response.json();
console.log(journeyPlan);
}

await getDirections();


async function busBoard() {
    const coordinates = await getCoordinates();
    const stopCodes = await fetchStopCode(coordinates.latitude, coordinates.longitude);
    return fetchBuses(stopCodes); 
}

 busBoard();