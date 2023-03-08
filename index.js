 
// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
const NodeGeocoder = require('node-geocoder');
const SunCalc = require('suncalc3');

const options={
    provider: 'locationiq',
    apiKey: "pk.ab787b834bceec8e3f08c984da9e72dc",
    formatter: null
};

const geocoder = NodeGeocoder(options);

// Create a single supabase client for interacting with your database
const supabase = createClient('https://banraxrzqacvpzsonavh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhbnJheHJ6cWFjdnB6c29uYXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzczMzkzNTksImV4cCI6MTk5MjkxNTM1OX0.gRfvdnzSN_jBTmi2iY1GPOK10flQIp_tUgyeRD3K90I');

// supabase.from('light').select('*').then(console.log)

// supabase
//   .channel('any')
//   .on('postgres_changes', { event: '*', schema: 'public', table: 'light' }, payload => {
//     console.log('Change received!', payload)
//   })
//   .subscribe()


supabase
  .channel('any')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'light'}, payload => {

    //show payload difference
    for (let key in payload.new) {
        if (payload.new[key] != payload.old[key]) {
            console.log(payload.new.name, key, payload.old[key], "changed to", payload.new[key])
        }
    }
  })
  .subscribe()

function getCoordinates(address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode(address).then((response) => {
      if(response.length == 0) {
        reject(response);
      } else {
        resolve({latitude: response[0].latitude, longitude: response[0].longitude});
      }
    });
  });
}

async function setAreaState(areaId, state) {
  await supabase.from("light").update({state: state}).eq("area", areaId);
  await setAreaTimer(areaId);
  // Sleep needed to respect LocationIQ API limit
  await new Promise(r => setTimeout(r, 500));
}

async function setAreaTimer(areaId) {
  const city = (await supabase.from("area").select("city").eq("id", areaId)).data[0]['city'];
  getCoordinates(city).then((coordinates) => {
    let sunTimes = SunCalc.getSunTimes(new Date(), coordinates.latitude, coordinates.longitude);
    let civilDusk = new Date(sunTimes.civilDusk.ts);
    let civilDawn = new Date(sunTimes.civilDawn.ts);
    let currentTime = new Date();
    // If I passed dawn I want to turn everything On with the timer, Off otherwise
    let state = currentTime > civilDawn;
    let target = civilDusk;
    if(state && currentTime > civilDusk) {
      // For today I have finished, I want to turn off lights tomorrow morning
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      target = new Date(SunCalc.getSunTimes(tomorrow, coordinates.latitude, coordinates.longitude).civilDawn.ts);
    }
    let timeout = Math.abs(target - currentTime);
    console.log(target);
    setTimeout(() => setAreaState(areaId, state), timeout);
  }).catch((reason) => {console.log(reason)});
}

async function setTimers() {
  const areas = (await supabase.from("area").select()).data;
  for(let i = 0; i < areas.length; ++i) {
    setAreaTimer(areas[i]["id"]);
    // Sleep needed to respect LocationIQ API limit
    await new Promise(r => setTimeout(r, 500));
  }
}

setTimers();