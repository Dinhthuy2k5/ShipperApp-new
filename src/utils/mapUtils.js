export function decodePolyline(encoded) {
    if (!encoded) return [];
    let poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        poly.push([lng * 1e-5, lat * 1e-5]);
    }
    return poly;
}

export function getBounds(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return [[105.8522, 21.0285], [105.8522, 21.0285]];
    }
    let minLng = coordinates[0][0], maxLng = coordinates[0][0];
    let minLat = coordinates[0][1], maxLat = coordinates[0][1];

    coordinates.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    });
    return [[maxLng, maxLat], [minLng, minLat]];
}