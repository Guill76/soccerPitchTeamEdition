var geocodeService = L.esri.Geocoding.geocodeService();
var popup = L.popup();
var newMarkers = [];
var newdata = [];
var updProps = [];
var contentPost;
var existingMarkers = [];
function now() {
    var D = new Date();
    var DD, MM, HH, Mi, ss;
    if (D.getDate() < 10) DD = "0" + D.getDate(); else DD = D.getDate();
    if ((D.getMonth() + 1) < 10) MM = "0" + (D.getMonth() + 1); else MM = (D.getMonth() + 1);
    if (D.getHours() < 10) HH = "0" + D.getHours(); else HH = D.getHours();
    if (D.getMinutes() < 10) Mi = "0" + D.getMinutes(); else Mi = D.getMinutes();
    if (D.getSeconds() < 10) ss = "0" + D.getSeconds(); else ss = D.getSeconds();
    return (D.getFullYear() + "-" + MM + "-" + DD + "T" + HH + ":" + Mi + ":" + ss + "." + (D.getMilliseconds()) + "Z");
}
function onMapClick(e) {
    var tmp;
    var tmpDataObj;
    
    geocodeService.reverse().latlng(e.latlng).run(function (error, result) {
        var addr;
        if (result) {
            tmp = L.marker(result.latlng);
            addr = result.address.Match_addr;
        } else {
            tmp = L.marker(e.latlng);
            addr = 'NA';
        }
        tmpDataObj = {
            "type" : "Feature", 
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lng, e.latlng.lat]
            },
            "properties": {
                "Name": "Antenne_" + e.latlng.lat + "_" + e.latlng.lng,
                "Status": "Active",
                "ShowOnTheMap": "yes",
                "Address": addr,
                "Created_Date": now(),
                "PopupContent": "Antenne_" + e.latlng.lat + "_" + e.latlng.lng
            }
        };
        tmp.addTo(mymap)
                    .bindPopup('<b>Nouvelle antenne</b><br>Nouvelle antenne<br>Coord(' + e.latlng.lat + ',' + e.latlng.lng + ')<br> Adresse: ' + addr)
        
        newMarkers.push(tmp);
        
        newdata.push(tmpDataObj);
    });
                
}
var mymap = L.map('mapid');

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

$.getJSON('/geoJson?type=Point', function (result) {
    var tmp;
    if (result) {
        L.geoJSON(result, {
            pointToLayer: function (feature, latlng) {
                tmp = L.marker([latlng.lat, latlng.lng]);
                tmp.on('click', function (e){
                    updateProperties(feature); 
                });
                existingMarkers.push(tmp);
                return tmp;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.PopupContent);
            }
        }).addTo(mymap);
        if (existingMarkers.length > 0) {
            var group = new L.featureGroup(existingMarkers);
            mymap.fitBounds(group.getBounds());
        } else {
            geocodeService.geocode().text('Paris').run(function (error, response) {
                mymap.fitBounds(response.results[0].bounds);
                mymap.setZoom(9);
            });
        }
    }
                
});
L.control.scale().addTo(mymap);
mymap.on('click', onMapClick);
document.getElementById('saveMapInfo').addEventListener('click', postJson);
document.getElementById('deleteOne').addEventListener('click', delObj);
document.getElementById('updOne').addEventListener('click', updObj);
function postJson() {
    $.ajax({
        url: '/savingMap', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify(newdata)
    }).done(function (response) {
        $("#result").html(JSON.stringify(response));
                          //alert('success');
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert('FAILED! ERROR: ' + errorThrown);
    });
};
function updateProperties(location) {
    document.getElementById('id').value = location._id;
    document.getElementById('Nom').value = location.properties.Name;
    document.getElementById('Address').value = location.properties.Address;
    document.getElementById('lat').value = location.geometry.coordinates[1];
    document.getElementById('lng').value = location.geometry.coordinates[0];
    document.getElementById('popupContent').innerHTML = location.properties.PopupContent;
};

function delObj(){
    document.getElementById('formUpdate').action = '/map?action=delete';
};
function updObj() {
    document.getElementById('formUpdate').action = '/map?action=update';
};