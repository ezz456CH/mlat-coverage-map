mapboxgl.accessToken = 'pk.eyJ1IjoiZXp6NDU2Y2giLCJhIjoiY2xyejA2c21qMXR1ZjJtcHF4OWNwYmx0ayJ9.t0RfR9x4m8owrAuoVlnQtQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ezz456ch/clukyvend002x01pb8xor4jrr',
    zoom: 1.5,
    hash: true
});

map.on('load', async () => {
    
    try {
        const rainviewer = await fetch('https://api.rainviewer.com/public/weather-maps.json')
            .then(res => res.json());
    
        const newframe = rainviewer.radar.nowcast[rainviewer.radar.nowcast.length - 1];
    
        map.addLayer({
            id: 'rainviewer',
            type: 'raster',
            source: {
                type: 'raster',
                tiles: [`${rainviewer.host}${newframe.path}/256/{z}/{x}/{y}/2/1_1.png`],
                tileSize: 256
            },
            layout: { visibility: 'visible' },
            minzoom: 0,
            maxzoom: 18,
            paint: {
                'raster-opacity': 0.5
            }
        });
    
    } catch (error) {
        console.error(error);
    }

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

        // Add a layer for displaying icon
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