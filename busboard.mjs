
import fetch from "node-fetch"

async function fetchBusTimes ( ){

const response = await fetch("https://api.tfl.gov.uk/StopPoint/{id}/Arrivals?id=490008660N");
const buses = await response.json();
buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
buses.slice(0,5);
for (const bus of buses){
    console.log(` Next bus is in ${bus.timeToStation} seconds. `);
}

}

fetchBusTimes ();
 
