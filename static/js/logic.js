// Fetch earthquake data from earthquake.usgs.gov for the last 7 days
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    createMap(data);
  });

function createMap(data) {
  const map = L.map('map').setView([0, 0], 2);
  
  // using openstreetmap.org
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const earthquakes = data.features;

  for (const earthquake of earthquakes) {
    const { geometry, properties } = earthquake;
    const [longitude, latitude, depth] = geometry.coordinates;
    const magnitude = properties.mag;

    // Calculate marker size based on magnitude
    const markerSize = magnitude * 5;

    // Calculate marker color based on depth
    const markerColor = getColor(depth);

    // marker setup
    const marker = L.circleMarker([latitude, longitude], {
      radius: markerSize,
      fillColor: markerColor,
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);

    // popup that provides additional information about the earthquake when its associated marker is clicked
    marker.bindPopup(`
      <strong>Location:</strong> ${properties.place}<br>
      <strong>Magnitude:</strong> ${magnitude}<br>
      <strong>Depth:</strong> ${depth} km
    `);
  }

  // Legend setup
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'legend');
    const depths = [-10, 10, 30, 50, 70, 90];
    const labels = [];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
    }

    return div;
  };

  legend.addTo(map);
}

// colors being used
function getColor(depth) {
  return depth >= 90 ? '#800026' :
         depth >= 70 ? '#BD0026' :
         depth >= 50 ? '#E31A1C' :
         depth >= 30 ? '#FC4E2A' :
         depth >= 10 ? '#FD8D3C' :
                       '#FEB24C';
}
