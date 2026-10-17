/**
 * Contextual Citizen Dialogue & Autonomous Thoughts (Agent SIM-4 & SIM-5)
 * Rich dialogue corpus for living Solarpunk settlement residents,
 * reacting dynamically to What-If systemic levers and circadian life.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const CITIZEN_DIALOGUES = {
  HIGH_AUTOMATION: [
    "🤖 Bots cancelled 5h of chores! Heading to Agora for poetry.",
    "🌾 The Agro-Rovers freed up our whole afternoon.",
    "🎨 Post-labor life: sculpting in the workshop with cobots.",
    "✨ When machines serve the commons, humans thrive.",
    "📚 Time to study permaculture and read in the library.",
    "🍵 Zero compulsory drudgery today. Enjoying herbal tea."
  ],
  LOW_AUTOMATION: [
    "🛠️ Manual shift today, but shared labor keeps it light.",
    "🌱 Weeding the aeroponic towers with the morning crew.",
    "🤝 Sharing the rotational tasks: 4 hours and we're done.",
    "⚙️ Let's fabricate more cobots in the FabLab soon!"
  ],
  WEATHER_RAIN: [
    "🌧️ Rain catchment cisterns filling up fast!",
    "💧 Pure rainwater refilling our 50,000 L reservoir.",
    "🌿 The permaculture bioswales love this gentle rain.",
    "🌱 Deep roots soaking in moisture across the food forest."
  ],
  WEATHER_STORMY: [
    "⛈️ Wind turbines spinning at maximum rated kW!",
    "⚡ High winds filling up our LiFePO4 battery bank.",
    "🌪️ Checking the greenhouse storm anchors and LoRa masts.",
    "🛡️ Safe and cozy inside our bioclimatic usufruct pods."
  ],
  WEATHER_HEATWAVE: [
    "🌡️ Cold filtered water at the Agora fountain is heaven.",
    "🌿 Shaded under the jasmine pergola and solar canopies.",
    "❄️ Misting chillers keeping the living pods pleasant.",
    "💧 Hydroponics closed-loop saves 90% water in this heat."
  ],
  WEATHER_SUNNY: [
    "☀️ Solar PV array is pumping +45 kW into the microgrid!",
    "🌻 Perfect day for drying heirloom seeds on the patio.",
    "⚡ Batteries will hit 100% capacity before 2 PM.",
    "✨ Solarpunk daylight at its absolute finest."
  ],
  WEATHER_OVERCAST: [
    "☁️ Soft diffused light is great for outdoor permaculture.",
    "💨 Steady breeze keeps the wind turbines generating.",
    "🍵 A thoughtful, quiet afternoon in the Agora."
  ],
  SHOCK_GRID_SEVERED: [
    "⚡ External grid severed! Local microgrid holding 100% steady.",
    "🔌 Who needs commercial power? Our batteries have us covered.",
    "🛡️ Total energy autonomy in action: 0 brownouts.",
    "🤝 Autonomous commons resilience: tested and proven."
  ],
  SHOCK_GRID_CONNECTED: [
    "🌐 Bioregional grid inter-tie re-established.",
    "⚡ Exporting surplus green kWh to neighboring districts."
  ],
  SHOCK_ARRIVALS: [
    "👥 Welcoming new climate arrivals to Detroit Delray!",
    "🏡 Assembling modular usufruct pods on the perimeter.",
    "🏛️ Expanding the Sortition Assembly circle with new voices.",
    "🤝 The commons grows stronger with every pair of hands."
  ],
  CIRCADIAN_DAWN: [
    "🌅 Good morning! Sun rising over the solar arrays.",
    "🍵 Fresh mint infusion from the community greenhouse.",
    "🐓 Village waking up to another day of creative freedom."
  ],
  CIRCADIAN_NOON: [
    "☀️ Peak solar hour! Free energy running the FabLab.",
    "🍲 Lunch gathering at the Agora shared kitchen.",
    "🥗 Fresh aeroponic greens harvested 20 minutes ago."
  ],
  CIRCADIAN_DUSK: [
    "🌇 Sunset glow over the bioswales. Beautiful twilight.",
    "🔋 Switching load over to battery bank storage.",
    "🎻 Acoustic music gathering starting by the firepit."
  ],
  CIRCADIAN_NIGHT: [
    "🌙 Night watch on perimeter. All systems stable.",
    "✨ Stargazing from the observatory deck.",
    "🕯️ Amber lanterns lighting the boulevards."
  ],
  AMBIENT_COMMONS: [
    "🛡️ No landlords, no eviction fear: true housing usufruct.",
    "🌾 Our granary holds 28 days of guaranteed calories.",
    "🤝 Just voted in the sortition assembly on water allocation.",
    "💻 3D printing spare bicycle bearings in the FabLab.",
    "🌸 The jasmine flowers around pod #14 smell incredible.",
    "🕊️ Living proof that cooperation outperforms extraction."
  ]
};

export function getRandomDialogue(category) {
  const pool = CITIZEN_DIALOGUES[category] || CITIZEN_DIALOGUES.AMBIENT_COMMONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
