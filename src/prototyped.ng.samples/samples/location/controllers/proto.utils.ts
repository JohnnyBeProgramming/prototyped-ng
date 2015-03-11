///<reference path="../../../imports.d.ts"/>

module proto.utils {

    export class Networking {

        public static GetClientInfo(window: any): any {
            var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            if (xmlhttp) {
                xmlhttp.open("GET", "http://api.hostip.info/get_html.php", false); // True for async...
                /* Async
                xmlhttp.onload = function (e) {
                    if (xmlhttp.readyState === 4) {
                        if (xmlhttp.status === 200) {
                            // defer.resolve(xmlhttp.responseText);
                            console.info(xmlhttp.responseText);
                        } else {
                            //defer.reject(error);
                            console.warn(xmlhttp.statusText);
                        }
                    }
                };
                xmlhttp.onerror = function (error) {
                    //defer.reject(error);
                    console.error(xmlhttp.statusText);
                };
                */
                xmlhttp.send();

                var info = {};
                var resp = <string>xmlhttp.responseText;
                var data = resp.split("\n");
                for (var i = 0; data.length >= i; i++) {
                    if (data[i]) {
                        var parts = data[i].split(":");
                        var objDef = (parts.length > 1) && (typeof parts[1] !== 'undefined');
                        if (objDef) {
                            var objKey = parts[0].trim();
                            var objVal = parts[1].trim();
                            if (objKey == 'Country' && objVal.indexOf('Unknown Country') >= 0) {
                                objVal = null;
                            }
                            if (objKey == 'City' && objVal.indexOf('Unknown City') >= 0) {
                                objVal = null;
                            }
                            eval('info.' + objKey + ' = objVal');
                        }
                    }
                }
                return info;
            }

            return null;
        }

        public static GetCurrentIP(window: any): string {
            var info = this.GetClientInfo(window);
            if (info) {
                return info.IP;
            }
            return null;
        }
    }

    export class GeoPoint {

        public Label: string;
        public Lat: number;
        public Lng: number;
        public Zoom: number;

        constructor(label: string, lat: number, lng: number, zoom: number = 8) {
            this.Label = label;
            this.Lat = lat;
            this.Lng = lng;
            this.Zoom = zoom;
        }

        public getPosition(): google.maps.LatLng {
            return new google.maps.LatLng(this.Lat, this.Lng);
        }
    }

    export class GeoFactory {

        constructor(private $rootScope: any, private $q: any) {
            console.log(' - [ Geo ] Factory Created...');
        }

        public GetPosition(): any {
            var defer = this.$q.defer();

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.$rootScope.$applyAsync(function () {
                        defer.resolve(position);
                    });                    
                },
                (error) => {
                    this.$rootScope.$applyAsync(function () {
                        defer.reject(error);
                    });
                });

            return defer.promise;
        }

        public static FormatLatitude(input: number, template: string): string {
            return (!input) ? null : GeoFactory.ConvertDDToDMS(true, input, template);
        }
        public static FormatLongitude(input: number, template: string): string {
            return (!input) ? null : GeoFactory.ConvertDDToDMS(false, input, template);
        }

        public static ParseDMS(input: string): any {
            var parts = [];
            var regEx = input.split(/[^\d\w]+/);
            for (var i = 0; i < regEx.length; i++) {
                parts.push(parseFloat(regEx[1]));
            }
            return {
                lat: GeoFactory.ConvertDMSToDD(parts[0], parts[1], parts[2], parts[3]),
                lng: GeoFactory.ConvertDMSToDD(parts[4], parts[5], parts[6], parts[7])
            }
        }

        public static ConvertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string): number {
            var dd = degrees + minutes / 60 + seconds / (60 * 60);
            if (direction == "S" || direction == "W") {
                dd = dd * -1; // Invert number
            }
            return dd;
        }
        public static ConvertDDToDMS(northToSouth: boolean, input: number, template: string): string {
            // Example Output: 54°21′44″N
            if (!template) template = '{0}°{1}′{2}″{3}';
            var dir = northToSouth ? (input > 0 ? 'N' : 'S') : (input > 0 ? 'E' : 'W');
            var inp = Math.abs(input);
            var deg = Math.floor(inp);
            var min = Math.floor((inp - deg) * 60);
            var sec = Math.floor(((inp - deg) * 60 - min) * 60);
            var dm = (min >= 10 ? '' + min : '0' + min);
            var ds = (sec >= 10 ? '' + sec : '0' + sec);
            return deg + '°' + dm + '′' + ds + '″' + dir;
        }
    }

    export class GoogleMapper {
        private MapArgs: any;
        private MapElem: Element;
        private MapTarg: google.maps.Map;
        private Options: google.maps.MapOptions;
        private Position: google.maps.LatLng;

        constructor(args: any) {
            this.MapArgs = args;
        }

        initMaps(callback?: () => void) {
            // Async load the google maps API and set up the callback
            var apiUrl = 'https://maps.googleapis.com/maps/api/js';
            var apiHnd = 'protoGoogleMapper';
            var apiArg = $.extend(this.MapArgs, {
                callback: apiHnd
            });

            // Check if already loaded (patch onLoad if needed)
            if (apiHnd in window) {
                if (callback) {
                    var func = window[apiHnd];
                    if (window[apiHnd].loaded) {
                        callback();
                    } else {
                        window[apiHnd] = () => {
                            func();
                            callback();
                        };
                    }
                }
                return;
            }

            // Declare the global callback
            window[apiHnd] = () => {
                // Bind the map to the element
                this.bindMaps();

                // Check for handler
                if (callback) {
                    callback();
                }

                // Delete callback
                window[apiHnd].loaded = true;
            };

            // Can't use the jXHR promise because 'script' doesn't support 'callback=?'
            $.ajax({ dataType: 'script', data: apiArg, url: apiUrl });
        }

        getMap(): google.maps.Map {
            return this.MapTarg;
        }

        isMapsDefined(): boolean {
            return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
        }

        bindMaps() {
            // Ensure google maps available
            if (this.isMapsDefined()) {
                console.log(' - [ Geo ] Init Google maps...');

                // Set default position
                if (!this.Position) {
                    this.Position = new google.maps.LatLng(0, 0);
                }

                // Define position and the map options
                var pos = this.Position;
                var opt = this.Options = {
                    zoom: 5,
                    center: pos,
                    mapTypeControlOptions: {
                        mapTypeIds: [
                            google.maps.MapTypeId.HYBRID,
                            google.maps.MapTypeId.ROADMAP,
                            google.maps.MapTypeId.SATELLITE,
                            google.maps.MapTypeId.TERRAIN,
                        ]
                    },
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                };

                // Load the maps
                var div = this.MapElem = document.getElementById('map-canvas');
                var map = this.MapTarg = new google.maps.Map(div, opt);
                if (map) {
                    // Load more map options
                    map.setCenter(this.Position);
                }

                console.log(' - [ Geo ] Google maps loaded.');
            } else {
                console.warn(' - [ Geo ] Warning: Google maps is not available...');
            }
        }

        createMarker(lat: number, lng: number, obj: any = {}): google.maps.Marker {
            // Return a new instance of a marker
            return new google.maps.Marker($.extend(obj, {
                position: new google.maps.LatLng(lat, lng),
                map: this.MapTarg
            }))
        }

        setPosition(lat: number, lng: number, zoom?: number): boolean {
            var pos = new google.maps.LatLng(lat, lng);
            if (pos && this.MapTarg) {
                console.log(' - [ Geo ] Changing map position to [ ' + lat + ' , ' + lng + ' ]');

                // Update the map view port
                this.MapTarg.setCenter(pos);
                this.Position = pos;

                // Position set on map successfuly
                return true;
            } else {
                // Save the current position
                this.Position = pos;

                // Deferred action, position saved
                return false;
            }
        }
    }
}  