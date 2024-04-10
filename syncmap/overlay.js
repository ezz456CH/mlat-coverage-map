mapboxgl.accessToken = 'pk.eyJ1IjoiZXp6NDU2Y2giLCJhIjoiY2xyejA2c21qMXR1ZjJtcHF4OWNwYmx0ayJ9.t0RfR9x4m8owrAuoVlnQtQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ezz456ch/clukyvend002x01pb8xor4jrr',
    zoom: 1.5,
    hash: true,
    attributionControl: false
}).addControl(new mapboxgl.AttributionControl({
    customAttribution: '<a target="_blank" rel="noopener noreferrer" href="https://www.rainviewer.com/api.html">RainViewer.com</a>'
}));

map.dragRotate.disable();

map.touchZoomRotate.disableRotation();

map.on('load', async () => {
    try {
        // fetch weather radar data from rainviewer
        const rainviewer = await fetch('https://api.rainviewer.com/public/weather-maps.json')
            .then(res => res.json());

        const newframe = rainviewer.radar.past[rainviewer.radar.past.length - 1];

        // remove rainviewer layer if already exists
        if (map.getLayer('rainviewer')) {
            map.removeLayer('rainviewer');
            map.removeSource('rainviewer');
        }

        map.addLayer({
            id: 'rainviewer',
            type: 'raster',
            source: {
                type: 'raster',
                tiles: [`${rainviewer.host}${newframe.path}/512/{z}/{x}/{y}/6/1_1.png`],
                tileSize: 512
            },
            layout: { visibility: 'visible' },
            minzoom: 0,
            maxzoom: 18,
            paint: {
                'raster-opacity': 0.35
            }
        });

    } catch (error) {
        console.error(error);
    }

    setInterval(async function () {
        try {
            // fetch weather radar data from rainviewer
            const rainviewer = await fetch('https://api.rainviewer.com/public/weather-maps.json')
                .then(res => res.json());

            const newframe = rainviewer.radar.past[rainviewer.radar.past.length - 1];

            // remove rainviewer layer if already exists
            if (map.getLayer('rainviewer')) {
                map.removeLayer('rainviewer');
                map.removeSource('rainviewer');
            }

            map.addLayer({
                id: 'rainviewer',
                type: 'raster',
                source: {
                    type: 'raster',
                    tiles: [`${rainviewer.host}${newframe.path}/512/{z}/{x}/{y}/6/1_1.png`],
                    tileSize: 512
                },
                layout: { visibility: 'visible' },
                minzoom: 0,
                maxzoom: 18,
                paint: {
                    'raster-opacity': 0.35
                }
            });

        } catch (error) {
            console.error(error);
        }
    }, 600000); //update rainviewer layer every 10 minutes

    let features = [];

    try {
        const regioninfo = await fetch('mirror_regions.json');
        const regiondata = await regioninfo.json();

        for (const region of Object.values(regiondata)) {
            if (region.enabled) {
                const response = await fetch(`/sync/${region.region}/sync.json`);
                const data = await response.json();

                const regionFeatures = Object.keys(data).map(key => ({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [data[key].lon, data[key].lat]
                    },
                    'properties': {
                        'description': `
                        <p style="margin: 0px">Name: ${key}<br>
                        Region: ${region.name} (${region.region})<br>
                        Pos.: ${data[key].lat}, ${data[key].lon}<br>
                        <p class="link" style="margin:0px">*Approximate location</p>
                        <a class="link" style="pointer-events: auto;" href="/sync/feeder.html?${region.region}&${key}#">Synced Stats</a>
                        `
                    }
                }));

                features = [...features, ...regionFeatures];
            }
        }

        map.addSource('locations', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: features
            }
        });

        // add icon layer
        map.addLayer({
            'id': 'locations-layer',
            'type': 'symbol',
            'source': 'locations',
            'layout': {
                'icon-image': 'triangle-1',
                'icon-allow-overlap': true
            },
            'paint': {
                'icon-opacity': 0.5
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    map.on('click', 'locations-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        const popupContent = `
            ${properties.description}
        `;

        new mapboxgl.Popup(
            {
                closeButton: false,
            }
        )
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
    });

    map.on('mouseenter', 'locations-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'locations-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});