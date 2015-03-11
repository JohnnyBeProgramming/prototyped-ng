///<reference path="../../../imports.d.ts"/>
///<reference path="proto.ts"/>
///<reference path="proto.utils.ts"/>

module proto.samples.location {

    export class GeoController {

        private Mapper: proto.utils.GoogleMapper;
        private Samples: proto.utils.GeoPoint[];

        private Client: any;
        private Marker: google.maps.Marker;
        private PinsPOI: google.maps.Marker[];

        constructor(private $rootScope: any, private $scope: any, private geo : proto.utils.GeoFactory) {
            // Link to current scope
            this.$scope.geoCtrl = this;

            // Load resources
            this.init();
        }

        init() {
            this.initMaps((map) => {
                // Load sample data
                this.getSamples();

                // Request network and geo location info
                this.getClientInfoPassive((response) => {
                    this.$rootScope.$applyAsync(() => {
                        this.setClientInfoResponse(response);
                    });                    
                });
            });
        }

        setClientInfoResponse(response: any) {
            if (response) {
                // Set the client info
                this.$scope.client = this.Client = response;

                // Get results
                var ip = response.ip;
                var org = response.org;
                var city = response.city;
                var region = response.region;
                var country = response.country;
                var hostname = response.hostname;

                // Parse Lat Long
                var lat, lng;
                var loc = response.loc;
                if (loc) {
                    var ll = loc.split(',');
                    if (ll.length > 1) {
                        lat = ll[0];
                        lng = ll[1];
                    }
                }
                if (lat && lng) {
                    var lbl = country + ' ( ' + ip + ' )';
                    var pin = new proto.utils.GeoPoint(lbl, lat, lng, 3);
                    var url = 'https://chart.googleapis.com/chart?chst=d_simple_text_icon_left&chld=' + country + '|14|FFF|flag_' + country.toLowerCase() + '|20|FFF|333';

                    // Set the country of origin
                    this.setGeoPoint(pin,
                        {
                            icon: 'http://maps.gstatic.com/mapfiles/markers2/dd-via.png',
                        },
                        {
                            content: '<div>' + lbl + '</div>' //'<img src="' + url + '" />',
                        });
                }
            }
        }
        getClientInfoPassive(callback?: (response) => void) {
            // Request client info from online service
            $.get("http://ipinfo.io", (response) => {
                if (callback) {
                    callback(response);
                }
            }, "jsonp");
        }

        initMaps(callback?: (map: google.maps.Map) => void) {
            // Define the google mapper class
            this.Mapper = new proto.utils.GoogleMapper({
                'v': '3.exp',
                //'key': apiKey,
                'sensor': false,
                'libraries': 'places,weather',
            });

            // Start the mapper class
            this.Mapper.initMaps(() => {
                var map = this.Mapper.getMap();
                if (map) {
                    // Load resources
                    this.loadMaps(map);
                }

                // Maps loaded, update UI...
                this.$rootScope.$applyAsync(() => {                    
                    if (callback) callback(map);
                });
            });
        }
        loadMaps(map: google.maps.Map) {
            // Load additional map resources

            var transitLayer = new google.maps.TransitLayer();
            transitLayer.setMap(map);

            var cloudLayer = new google.maps.weather.CloudLayer();
            cloudLayer.setMap(map);

            var objClass = eval('google.maps.weather.WeatherLayer');
            var weatherLayer = new objClass({
                temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
            });
            weatherLayer.setMap(map);
        }

        getStatus(): string {
            var lbl = 'Unavailable';
            if (this.$scope.client) {
                lbl = this.$scope.client.hostname
                || this.$scope.client.city
                || this.$scope.client.country ? 'Somewhere in ' + this.$scope.client.country : 'Locating...';
            }
            if (this.$scope.position) {
                lbl = this.$scope.position.coords
                ? 'Position Found'
                : (this.$scope.position.isBusy ? 'Requesting...' : 'Request Declined');
            }
            return lbl;
        }

        getPosition() {
            console.info(' - [ Geo ] Requesting position...');
            this.$scope.position = {
                timestamp: Date.now(),
                isBusy: true,
            }

            // Request the current GPS position from browser
            this.geo.GetPosition()
                .then((position) => {
                    console.log(' - [ Geo ] Position found!');

                    // Update current position
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    this.$scope.position = position;
                    this.Mapper.setPosition(lat, lng);

                    // Set a marker at current location
                    if (!this.Marker) {
                        // Create a mew marker
                        var marker = this.Marker = this.Mapper.createMarker(lat, lng, {
                            title: 'Your Location',
                            animation: google.maps.Animation.DROP,
                            icon: 'http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png',
                            //icon: 'https://google-maps-utility-library-v3.googlecode.com/svn/trunk/geolocationmarker/images/gpsloc.png',
                        });

                        // Add the info window
                        var infowindow = new google.maps.InfoWindow({ content: '<em>Your current location</em>' });
                        var map = this.Mapper ? this.Mapper.getMap() : null;
                        if (map) {
                            // Add click event to pin
                            google.maps.event.addListener(marker, 'click', () => {
                                infowindow.open(map, marker);
                            });
                            infowindow.open(map, marker);
                            map.setZoom(16);

                            if (position.coords.accuracy) {
                                var accuracyZone = {
                                    strokeColor: '#0000FF',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                    fillColor: '#61d8f3',
                                    fillOpacity: 0.15,
                                    map: map,
                                    center: marker.getPosition(),
                                    radius: position.coords.accuracy
                                };
                                // Add the circle for this city to the map.
                                var zoneCircle = new google.maps.Circle(accuracyZone);
                            }
                        }

                    } else {
                        // Update existing
                        this.Marker.setPosition(new google.maps.LatLng(lat, lng));
                    }
                },
                (ex) => {
                    console.error(' - [ Geo ] ' + (ex.message || 'Request denied.'));

                    // Update UI state
                    this.$scope.position = {
                        timestamp: Date.now(),
                        failed: true,
                    }
                });
        }

        setGeoPoint(point: proto.utils.GeoPoint, opts?: any, infoWindowOpts?: any) {
            var lat = point.Lat;
            var lng = point.Lng;
            var key = '' + lat + '_' + lng;
            var pin = null;
            if (!pin) {
                var opts = $.extend(opts || {}, {
                    title: point.Label
                });
                if (!opts.icon) {
                    opts.icon = 'http://maps.gstatic.com/mapfiles/markers2/icon_greenC.png';
                }
                pin = this.Mapper.createMarker(lat, lng, opts);
                //this.PinsPOI[key] = pin;

                // Add the info window
                if (infoWindowOpts) {
                    var map = this.Mapper ? this.Mapper.getMap() : null;
                    if (map) {
                        var opts = $.extend(infoWindowOpts, {
                        });
                        if (!opts.content) {
                            opts.content = '<div>' + point.Label + '</div>';
                        }

                        var infowindow = new google.maps.InfoWindow(opts);
                        infowindow.open(map, pin);

                        // Add click event to pin
                        google.maps.event.addListener(pin, 'click', () => {
                            infowindow.open(map, pin);
                        });
                    }
                }
            }
            if (this.Mapper) {
                this.Mapper.setPosition(lat, lng);
            }
        }

        setPosition(lat: number, lng: number) {
            if (this.Mapper) {
                this.Mapper.setPosition(lat, lng);
            }
        }

        hasSamples(): boolean {
            return this.Samples && this.Samples.length > 0;
        }

        getSamples(): proto.utils.GeoPoint[] {
            // Ensure maps loaded
            if (!this.Mapper || !this.Mapper.isMapsDefined()) return [];

            // Define if not exist
            if (!this.Samples) {
                this.Samples = [
                    new proto.utils.GeoPoint('New York', 40.7056258, -73.97968, 10),
                    new proto.utils.GeoPoint('London', 51.5286416, -0.1015987, 10),
                    new proto.utils.GeoPoint('Paris', 48.8588589, 2.3470599, 12),
                    new proto.utils.GeoPoint('Amsterdam', 52.3747158, 4.8986166, 12),
                    new proto.utils.GeoPoint('Cape Town', -33.919892, 18.425713, 9),
                    new proto.utils.GeoPoint('Hong Kong', 22.3700556, 114.1535941, 11),
                    new proto.utils.GeoPoint('Sydney', -33.7969235, 150.9224326, 10),
                ];
            }
            return this.Samples;
        }
    }

}  