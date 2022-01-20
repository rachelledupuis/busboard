const fetch = require('node-fetch')

//fetch is an asynchronous function
/* fetch('https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18')
    .then(response => response.json())
    .then(body => console.log(body)); */
  

//synchronizes an asychronous function
async function fetchBuses() {
    const response = await fetch('https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_key=ba9752d29aad406bbeb76a9fa432df18');
    const buses = await response.json();

    buses.sort((bus1, bus2) => bus1.timeToStation - bus2.timeToStation);
    let firstFiveBuses = buses.slice(0, 5);

    for (const bus of firstFiveBuses) {
        let minutes = Math.floor(bus.timeToStation / 60)
        console.log(`Bus ${bus.lineName} to ${bus.destinationName} is arriving in ${minutes} minutes.`)
    }
}

fetchBuses();