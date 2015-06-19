///<reference path="../../../imports.d.ts"/>
/// <reference path="../../../../typings/firebase/firebase.d.ts" />

module proto.ng.samples.data {

    export interface ISampleDataContext {
        name: string;
        rows: number;
        args: any[];
    }

    export interface IDataGenerator {
        name: string;
        populate(rows: number, columns: any): any;
    }

    export class ChanceDataGenerator implements IDataGenerator {
        public name: string = 'chance';
        private instance: any;

        constructor(private $q: any) {
            this.instance = new Chance();
        }

        public populate(rows: number, columns: any): any {
            var deferred = this.$q.defer();

            if (columns) {
                var list = [];
                for (var r = 0; r < rows; r++) {
                    var item = {};
                    for (var col in columns) {
                        item[col] = this.format(columns[col]);
                    }
                    list.push(item);
                }
                deferred.resolve(list);
            } else {
                var error = new Error('No column definition was found.');
                deferred.reject(error);
            }

            return deferred.promise;
        }

        public format(input: string): any {
            var result = null;
            try {
                var match = /(\{)([^\}]+)(\})/i.exec(input);
                if (match.length > 2) {
                    var name = match[2];
                    var opts = null;//match[3];
                    if (name in this.instance) {
                        result = this.instance[name]();
                    } else {
                        console.debug('Not Found: chance.' + name + '()');
                    }
                }
            } catch (ex) {
                result = null;
            }
            return result;
        }

    }

    export class FillTextGenerator implements IDataGenerator {
        public name: string = 'fillText';

        constructor(private $q: any, private appConfig: any) { }

        public populate(rows: number, columns: any): any {
            var list = [];
            var data = {
                rows: rows,
            };

            angular.extend(data, columns);
            return this.fetch(data);
        }

        public fetch(data): any {
            var deferred = this.$q.defer();

            var url = this.appConfig['sampleData'].fillText;
            if (url) {
                $.getJSON(url, data)
                    .done(function (data) {
                        deferred.resolve(data);
                    })
                    .fail(function (xhr, desc, err) {
                        var error = new Error('Error [' + xhr.status + ']: ' + xhr.statusText + ' - ' + err);
                        deferred.reject(error);
                    });
            } else {
                var error = new Error('Config setting "sampleData.fillText" is undefined.');
                deferred.reject(error);
            }

            return deferred.promise;
        }

    }

    export class SampleDataController {

        public busy: boolean;
        public edit: boolean;
        public sync: boolean;
        public error: Error;
        public context: ISampleDataContext;
        public _new: ISampleDataContext;
        public OnlineConn: any;
        public OnlineData: any;

        private _generators: IDataGenerator[];
        private _resultMap: any = {};

        constructor(private $rootScope: any, private $scope: any, private $state: any, private $stateParams: any, private $q: any, private $firebaseAuth: any, private $firebaseObject: any, private $firebaseArray: any, private appConfig: any) {
            this.init();
        }

        private init() {
            this.sync = true;

            // Create random data generators
            this._generators = [
                new ChanceDataGenerator(this.$q),
                new FillTextGenerator(this.$q, this.appConfig),
            ];

            // Set up firebase 
            var baseUrl = this.appConfig['sampleData'].dataUrl;
            if (baseUrl) {
                this.busy = true;
                this.OnlineConn = new Firebase(baseUrl + '/OnlineSamples');
                this.OnlineData = this.$firebaseArray(this.OnlineConn);
                this.OnlineData.$loaded()
                    .then(() => {
                        if (this.OnlineData) this.OnlineData.forEach((profile: ISampleDataContext) => {
                            this.loadProfile(profile);
                        });
                    })
                    .catch((err) => {
                        this.error = err;
                    }).finally(() => {
                        this.$rootScope.$applyAsync(() => {
                            this.busy = false;
                        });
                    });

            } else {
                this.error = new Error('Config setting "sampleData.dataUrl" is undefined.');
            }

        }

        public authenticate(type: any = null) {
            this.$firebaseAuth(this.OnlineConn)
                .$authWithOAuthPopup(type)
                .then((authData) => {
                    console.log("Logged in as:" + authData.uid, authData);
                    if (!this.OnlineData.length) {
                        this.createSamples();
                    }
                    this._new = {
                        name: authData.uid,
                        args: [],
                        rows: 10,
                    };
                })
                .catch((error) => {
                    this.error = error;
                    console.warn("Authentication failed:", error);
                });
        }

        public createSamples() {
            // Define default profiles
            if (this.appConfig['sampleData'].defaults) {
                this.appConfig['sampleData'].defaults.forEach((itm) => {
                    this.addProfile(itm);
                });
            }
        }

        public fetchData() {
            var deferred = this.$q.defer();
            try {
                // Set busy flag
                this.busy = true;
                this.edit = false;

                var data = [];
                var rows = this.context.rows;
                for (var r = 0; r < rows; r++) {
                    data.push({ $id: r });
                }

                // Build a map of generators
                var gens = [];
                this.context.args.forEach((item) => {
                    if (!item.val) return;
                    gens[item.type] = gens[item.type] || {};
                    gens[item.type][item.id] = item.val;
                });

                // Fetch the sample data
                var promises = [];
                this._generators.forEach((gen) => {
                    if (gen.name in gens) {
                        var deferred = gen.populate(rows, gens[gen.name])
                            .then((res) => {
                                var i = 0;
                                if (!res || !res.length) return;
                                while (i < res.length && i < data.length) {
                                    angular.extend(data[i], res[i]);
                                    i++;
                                }
                            })
                            .catch((error) => {
                                console.error(' - Error: ' + gen.name, error);
                            });

                        promises.push(deferred);
                    }
                });

                // Wait for results, then stitch them together
                this.$q.all(promises)
                    .finally(() => {
                        deferred.resolve(data);
                        this.$rootScope.$applyAsync(() => {
                            this.persistResult(this.context, data);
                            this.busy = false;
                        });
                    });

            } catch (ex) {
                this.error = ex;
                deferred.reject(ex);
            }

            return deferred.promise;
        }

        public loadProfile(profile: ISampleDataContext) {
            // ToDo: Fetch prev. result sets (async...)
            if ((<any>profile).resp) {
                this._resultMap[profile.name] = (<any>profile).resp;
            }

            /* Fusion table data
            var tableId = '17jbXdqXSInoNOOm4ZwMKEII0sT_9ukkqt_zuPwU';
            var query = "SELECT 'Country Name', '1960' as 'Population in 1960', '2000' as 'Population in 2000' FROM " + tableId + " ORDER BY 'Country Name' LIMIT 10";
            var encodedQuery = encodeURIComponent(query);

            // Construct the URL
            var url = ['https://www.googleapis.com/fusiontables/v1/query'];
            url.push('?sql=' + encodedQuery);
            url.push('&key=AIzaSyCAI2GoGWfLBvgygLKQp5suUk3RCG7r_ME');
            url.push('&callback=?');

            // Send the JSONP request using jQuery
            $.ajax({
                url: url.join(''),
                dataType: 'jsonp',
                success: function (data) {
                    var rows = data['rows'];
                    console.debug(' - Fusion Result: ', data);                    
                }
            });
            */
        }

        public persistResult(profile: ISampleDataContext, data: any[]) {

            this._resultMap[profile.name] = data;

            if (this.sync) {
                (<any>profile).resp = data;
                this.OnlineData.$save(profile);
            }
        }

        public hasResult(profile: ISampleDataContext): boolean {
            if (profile.name in this._resultMap) {
                return this._resultMap[profile.name].length;
            }
            return false;
        }

        public getResult(profile: ISampleDataContext): any[] {
            if (this.hasResult(profile)) {
                return this._resultMap[profile.name];
            }
            return [];
        }

        public addNew(item: ISampleDataContext) {
            if (!item || !item.name) return;
            return this.addProfile(item).then(() => {
                this._new = null;
            });
        }

        public addProfile(profile: ISampleDataContext) {
            return this.OnlineData.$add(profile).then(() => {
                this.edit = true;
                this.context = profile;
            });
        }

        public updateProfile(profile: ISampleDataContext, autoUpdate: boolean = false) {
            return this.OnlineData.$save(profile).then(() => {
                if (autoUpdate) {
                    this.$rootScope.$applyAsync(() => { });
                    return this.fetchData();
                }
            });
        }

        public removeProfile(profile: ISampleDataContext) {
            return this.OnlineData.$remove(profile);
        }

        public clearData(profile: ISampleDataContext) {
            this.persistResult(profile, []);
            return this.OnlineData.$save(profile);
        }

        public addColumn(profile: any, item: { id: string; val?: string }) {
            profile.args = profile.args || [];
            profile.args.push(item);
            return this.OnlineData.$save(profile);
        }

        public updateColumn(profile: any, item: { id: string; val?: string }) {
            profile.args = profile.args || [];
            profile.args.push(item);
            return this.OnlineData.$save(profile);
        }

        public removeColumn(profile: any, item: { id: string; val?: string }) {
            profile.args = profile.args || [];
            profile.args.splice(this.context.args.indexOf(item), 1);
            if (profile.args.length == 0) profile.resp = null;
            return this.OnlineData.$save(profile);
        }

    }

}  