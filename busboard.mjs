

// const readline =require("readline-sync")
import fetch from "node-fetch";
// console.log("Please enter your stoocode: ");
// const busStopCode = readline.prompt();

const busStopCode = "490008660N";
// const postCode = 


// FUNCTION TO GET LAT AND LONG GIVEN A POSTCODE

// async function fetchLatLon ( ){

//     const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${busStopCode}/Arrivals`);
//     const buses = await response.json();
//     buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
//     buses.slice(0,5);
//     for (const bus of buses){
//         console.log(`Bus to ${bus.destinationName} arriving in ${Math.floor(bus.timeToStation/60)} minutes. `);
//     }
    
//     }
    
    // fetchLatLon ();

// FUNCTION TO GET STOP CODE GIVE LAT AND LONG
async function fetchStopCode( ){

    const response1 = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=51.553935&lon=-0.144754&stopTypes=NaptanPublicBusCoachTram&radius=400`);

    const searchResults = await response1.json();
 
    searchResults.stopPoints.sort((dist1, dist2 )=> dist1.distance - dist2.distance);
    searchResults.slice(0,2);
    for (const result of searchResults){
        console.log(`${searchResults.stopPoints.distance}`);
    }
       
    }
    
    fetchStopCode ();


// FUNCTION TO GET STOP TIME GIVEN A STOP CODE

// async function fetchBusTimes ( ){
// const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${busStopCode}/Arrivals`);
// const response = await fetch(`https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals`);
// const buses = await response.json();
// buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
// buses.slice(0,5);
// for (const bus of buses){
//     console.log(`Bus to ${bus.destinationName} arriving in ${Math.floor(bus.timeToStation/60)} minutes. `);
// }
// }

// fetchBusTimes ();
      



 
