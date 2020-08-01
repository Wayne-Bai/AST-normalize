(function (document, g) {
    var Map = {
        config: {
            coordinates: {
                lat: null,
                lng: null
            },
            options: {
                center: null,
                zoom: 15,
                zoomControl: true,
                zoomControlOptions: {
                    style: g.maps.ZoomControlStyle.SMALL
                },
                disableDoubleClickZoom: false,
                mapTypeControl: true,
                scaleControl: true,
                scrollwheel: false,
                streetViewControl: false,
                draggable: true,
                overviewMapControl: false,
                mapTypeId: g.maps.MapTypeId.ROADMAP,
                mapMarker: true,
                panControl: false,
                styles: [
                    {
                        featureType: 'water',
                        stylers: [
                            {
                                color: '#badae7'
                            },
                            {
                                visibility: 'on'
                            }
                        ]
                    },
                    {
                        featureType: "landscape",
                        stylers: [
                            {
                                saturation: -150
                            },
                            {
                                lightness: 15
                            },
                            {
                                color: '#ececec'
                            },
                            {
                                visibility: 'on'
                            }
                        ]
                    },
                    {
                        featureType: 'road',
                        stylers: [
                            {
                                saturation: -100
                            },
                            {
                                lightness: 45
                            }
                        ]
                    },
                    {
                        featureType: 'road.highway',
                        stylers: [
                            {
                                visibility: 'simplified'
                            }
                        ]
                    },
                    {
                        featureType: 'road.arterial',
                        elementType: 'labels.icon',
                        stylers: [
                            {
                                visibility: 'on'
                            }
                        ]
                    },
                    {
                        featureType: 'administrative',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#444444'
                            }
                        ]
                    },
                    {
                        featureType: 'poi',
                        stylers: [
                            {
                                saturation: -100
                            },
                            {
                                lightness: 51
                            },
                            {
                                visibility: 'on'
                            }
                        ]
                    }
                ],

            },
            iconPath: null
        },
        map: null,
        marker: null,

        init: function (element) {
            // IE >= 10 doesn't support dataset so heres a fallback for that
            if(element.dataset !== undefined) {
                this.config.coordinates = {
                    lat: parseFloat(element.dataset.lat),
                    lng: parseFloat(element.dataset.lng)
                };

                this.config.iconPath = element.dataset.icon;

            } else {
                this.config.coordinates = {
                    lat: parseFloat(element.getAttribute('data-lat')),
                    lng: parseFloat(element.getAttribute('data-lng'))
                };

                this.config.iconPath = element.getAttribute('data-icon');
            }

            this.config.options.center = new g.maps.LatLng(this.config.coordinates.lat, this.config.coordinates.lng);

            this.map = new g.maps.Map(element, this.config.options);

            this.markerFactory();
            this.infoFactory();

            if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
                this.map.setOptions({draggable: false});
                this.map.setOptions({panControl: true});
                document.getElementById('map-link').style.display = 'block';
            }

            this.addListeners();
        },
        addListeners: function () {
            var that = this;
            window.onresize = function () {
                that.redraw();
            };
        },
        markerFactory: function () {
            var that = this;
            this.marker = new g.maps.Marker({
                position: new g.maps.LatLng(this.config.coordinates.lat, this.config.coordinates.lng),
                map: that.map,
                icon: that.config.iconPath
            });
        },
        infoFactory: function () {
            var that = this;
            var content = document.querySelector('[data-map-tpl="true"]').innerHTML;

            this.info = new g.maps.InfoWindow({
                content: content
            });
            this.info.open(that.map, that.marker);

            new g.maps.event.addListener(that.marker, 'click', function () {
                that.info.open(that.map, that.marker);
            });
        },
        redraw: function () {
            this.map.setCenter(this.marker.getPosition());
            this.map.panBy(0, -this.info.k.contentNode.clientHeight);
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('[data-map="true"]') !== null) {
            Map.init(document.querySelector('[data-map="true"]'));
        }
    });

}(document, google));
