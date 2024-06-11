var bmURL = 'https://tile.openstreetmap.de/{z}/{x}/{y}.png', 
bm = L.tileLayer(bmURL);

// Функция создания оверлей слоя дорожной обстановки 

function traffic(){
var trafficProvider = new ymaps.traffic.provider.Actual({},{
    infoLayerShown: true
});
trafficProvider.setMap(this._yandex);
};

// Реализация перехвата загрузки панели управления для изменеия её стиля 

L.Yandex.addInitHook('on', 'load', function(){
this._setStyle(this._yandex.controls.getContainer(),
{
    right: '50px',
    top: '11px',
    width: 'auto'
});
});

// Функция создания оверлей слоя дорожной обстановки c панелью управления

function trafficcntrl(){
this._yandex.controls
    .add('trafficControl', {size: 'auto'})
//        .add('typeSelector', {size: 'auto'})
    .get('trafficControl').state.set('trafficShown', true);
}

// Создание объектов базовых слоёв

const mapOSMdark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
attribution: '<b><i>Map by OSM & CartoDB</i></b>'
}),
    gSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 19,
        attribution: '<b><i>Google sat images</i></b>'
    }),

    yMap = L.yandex('map');

// Создание объектов оверлей-слоёв

// const permGKH = L.tileLayer.wms('https://romangis.nextgis.com/api/resource/660/wms',{
//     layers: 'ngw_id_656',
//     format: 'image/png',
//     transparent: true,
//     attribution: '<b><i>Data by "Реформа ЖКХ"</i></b>'
// })

const Oceans = L.tileLayer.wms('https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv',{
layers: 'GEBCO_LATEST_SUB_ICE_TOPO',
format: 'image/png',
transparent: true,
attribution: '<b><i>Общедоступная батиметрическая карта Мирового океана</i></b>'
})

// Создание собственного экземпляра класса на основе класса Icon

var myIcon = L.Icon.extend({
    options: {
        iconSize: [32, 32],
        popupAnchor: [0, -16]
    }
})

// Формирование массива иконок с использование собственного экземпляра класса myIcon

var boatIcons = [
    new myIcon({iconUrl:'./data/icons/boat.png'}),
    new myIcon({iconUrl:'./data/icons/pier.png'}),
    new myIcon({iconUrl:'./data/icons/usa.png'})
];

const boatLayers = L.layerGroup([
    L.marker([44.6264861,-124.0573266], {title: 'US coast guard', icon: boatIcons[0]})
    .bindPopup('<b>Название объекта</b><i> US coast guard </i><br><img src = "./data/Photos/85574552caaeb034ef33a910530a8459.jpg" width = 250px height = 167px >'),
    
    L.marker([44.6264149,-124.056177], {title: 'Bay Street Pier', icon: boatIcons[1]})
    .bindPopup('<b>Название объекта</b><i> Bay Street Pier </i><br><img src = "./data/Photos/photo0jpg.jpg" width = 250px height = 250px >'),
]);

// Добавление на карту данных из geojson файла

var buildingLayer = L.geoJSON(building, {
    pointToLayer: function(feature, latlng){
        let name = feature.properties.Name
        name == "US Coast Guard\n" ? icn = boatIcons[0]:
        name == "Bay Street Pier\n" ? icn = boatIcons[1]:
        icn = boatIcons[2]

        return L.marker(latlng, {icon: icn, title: feature.properties.Name})
    }
})
    .bindPopup(function(building) {
        let poinPhoto = '';
        if (building.feature.properties.Photo != null) {
            poinPhoto = '<br><img src = "./data/Photos/' 
            + building.feature.properties.id 
            + '/Photo1.png" width = "200" height = "120">'
        }
        return '<b>Название: </b>' + building.feature.properties.Name + poinPhoto
    });

// Создание объекта карты

var myMap = L.map('map', {
center: [44.622365, -124.059505],
zoom: [15],
layers: [bm]
}),
yTraffic = L.yandex('overlay')
    .on('load', traffic),
yTrafficCntrl = L.yandex('overlay')
    .on('load', trafficcntrl)

// Отключение флага и ссылки на Leflet

// Формировнаие списка базовых слоёв

var baseLayers = {
'Карта OSM' : bm,
'Тёмная карта OSM': mapOSMdark,
'Google спутник': gSat,
'Яндекс карта': yMap
},
overlayLayers = {
    'Карта данных': Oceans,
    'Яндекс пробки': yTraffic,
    'Яндекс пробки с эл. упр.': yTrafficCntrl,
    'Водные объекты': boatLayers,
    'Рандомные объекты': buildingLayer
};

// Созданиеи и добавление на карту элемента преключателя слоёв

L.control.layers(baseLayers, overlayLayers).addTo(myMap)

// Создание и добовление на карту элемента масштабной линейки  

L.control.scale({
imperial: false,
maxWidth: 200,
position: 'bottomleft'
}).addTo(myMap);

// Создание элемента интерфейса "Измерительные инструменты"

var msrCtrl = new L.Control.Measure({
localization: 'ru',
primaryLengthUnit: 'kilometers',
secondaryLenghtUnit: 'meters',
primaryAreaUnit: 'hectares',
secondaryAreaUnit: 'sqmeters',
decPoint: ',',
thosandsSep: ' ',
activeColor: '#ffa50a',
completedColor: '#ff5d4b'
});

// Добовление измерительных инструментов на карту

msrCtrl.addTo(myMap)


// // Создание линейного объекта

myMap.attributionControl.setPrefix(false);

// L.polygon([[44.6264861,-124.0573266],
//             [44.6264149,-124.056177],
//             [44.6260482,-124.0583549],
//             [44.6264861,-124.0573266] 
// ], {
//     weght: 2,
//     stroke: true,
//     opacity: 0.5,
//     color: '#ff0000',
//     lineCap: 'round',

// }).addTo(myMap)

// // Создание площадного объекта



// Создание элемент интерфейса для отображения легенды

var lgnd = L.control({
    position: 'bottomleft'
});

// Наполение элемента интрерфейса для отбражения легенды

lgnd.onAdd = function(myMap){
    let lgndDiv = L.DomUtil.create('div', 'lgndPanel'),
        labels = [];
    labels.push('<center><b>Легенда</b></center>');
    labels.push('<img src="./data/icons/boat.png" height="14" width="14"> - Лодка');
    labels.push('<img src="./data/icons/pier.png" height="14" width="14"> - Пирс');
    labels.push('<img src="./data/icons/usa.png" height="14" width="14"> - Оъекты, которые добавятся позже');
    lgndDiv.innerHTML = labels.join('<br>');
    return lgndDiv
};

// Добавление легенды на карту

// lgnd.addTo(myMap);

// Реализация добавления/удаления легенды при активации определённого слоя

function lgndAdd(e){
    lgnd.addTo(myMap)
};

function lgndRemove(e){
    lgnd.remove(myMap)
};

buildingLayer.on('add', lgndAdd);
buildingLayer.on('remove', lgndRemove);

// Загрузка видео мониторинга территории на карту

const regMon = L.latLngBounds([[44.631573, -124.062824], [44.625922, -124.051538]]);
// L.rectangle(regMon).addTo(myMap)

var ovNewPort = L.videoOverlay('data/Time.mp4', regMon, {
    autoplay: true,
    loop: true
})

ovNewPort.addTo(myMap);

// Реализация кнопок управления для мониторинга

function playvideo(){
    ovNewPort.getElement().play();
};
function pauseVideo(){
    ovNewPort.getElement().pause();
}; 
function playButton(){
    let btn = L.DomUtil.create('button');
    btn.innerHTML = '<b>Play</b>';
    L.DomEvent.on(btn, 'click', playvideo);
};
function pauseButton(){
    let btn = L.DomUtil.create('button');
    btn.innerHTML = '<b>Pause</b>';
    L.DomEvent.on(btn, 'click', pauseVideo);
};
function loadButtons(){
    let playCtrl = L.Control.extend({
        onAdd: playButton
    }),
        pauseCtrl = L.Control.extend({
            onAdd: pauseButton
        });
    (new playCtrl()).addTo(myMap);
    (new pauseCtrl()).addTo(myMap);
};

ovNewPort.on('load', loadButtons);