///<reference path="../../../imports.d.ts"/>
/// <reference path="../../../../typings/firebase/firebase.d.ts" />

module proto.ng.samples.data {

    export interface ISampleDataContext {
        name: string;
        rows: number;
        args: any[];
        resp?: any;
    }

    export interface IDataGenerator {
        name: string;
        populate(rows: number, columns: any): any[];
    }

    export class ChanceDataGenerator implements IDataGenerator {
        public name: string = 'chance';
        private instance: any;

        constructor() {
            this.instance = new Chance();
        }

        public format(input: string): any {
            return 'Chance';
        }

        public populate(rows: number, columns: any): any[] {
            var list = [];
            for (var r = 0; r < rows; r++) {
                var item = {};
                for (var col in columns) {
                    item[col] = this.format(columns[col]);
                }
                list.push(item);
            }
            return list;
        }
    }

    export class FillTextGenerator implements IDataGenerator {
        public name: string = 'fillText';

        constructor(private $rootScope: any, private $q: any) { }

        public format(input: string): any {
            return 'FillText';
        }

        public populate(rows: number, columns: any): any[] {
            var list = [];
            for (var r = 0; r < rows; r++) {
                var item = {};
                for (var col in columns) {
                    item[col] = this.format(columns[col]);
                }
                list.push(item);
            }
            return list;
        }

        private getArgs(rows: number, args: { id: string; val: string }[]): any {
            var data = {
                rows: rows,
            };
            args.forEach(function (obj) {
                if (obj.id) data[obj.id] = obj.val;
            });
            return data;
        }

        public test() {
            /*
            console.debug(' - Requesting... ', req);
            try {
                // Set busy flag
                this.busy = true;

                // Create and send the request
                var req = this.getArgs();
                return this.fetch(req)
                    .then((data) => {
                        this.context.resp = data;
                        this.OnlineData.$save(this.context);
                    })
                    .catch((error) => {
                        this.error = error;
                    })
                    .finally(() => {
                        this.$rootScope.$applyAsync(() => {
                            this.busy = false;
                        });
                    });
            } catch (ex) {
                this.error = ex;
            }
            */
        }

        public fetch(data) {
            var deferred = this.$q.defer();
            /*
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
                this.error = new Error('Config setting "sampleData.fillText" is undefined.');
                deferred.reject(this.error);
            }
            */
            return deferred.promise;
        }

    }

    export class SampleDataController {

        public busy: boolean;
        public edit: boolean;
        public error: Error;
        public context: ISampleDataContext;
        public _new: ISampleDataContext;
        public OnlineConn: any;
        public OnlineData: any;

        private _generators: IDataGenerator[];

        constructor(private $rootScope: any, private $scope: any, private $state: any, private $stateParams: any, private $q: any, private $firebaseAuth: any, private $firebaseObject: any, private $firebaseArray: any, private appConfig: any) {
            this.init();
        }

        private init() {
            // Create random data generators
            this._generators = [
                new ChanceDataGenerator(),
                new FillTextGenerator(this.$rootScope, this.$q),
            ];

            // Set up firebase 
            var baseUrl = this.appConfig['sampleData'].dataUrl;
            if (baseUrl) {
                this.busy = true;
                this.OnlineConn = new Firebase(baseUrl + '/OnlineSamples');
                this.OnlineData = this.$firebaseArray(this.OnlineConn);
                this.OnlineData.$loaded()
                    .then(() => {
                        console.log(' - Online Data Loaded: ', this.OnlineData);
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

        public test() {
            console.debug(' - Requesting... ');
            try {
                // Set busy flag
                this.busy = true;

                // Fetch the sample data
                var gens = [];
                this.context.args.forEach((item) => {
                    if (!item.val) return;
                    gens[item.type] = gens[item.type] || {};
                    gens[item.type][item.id] = item.val;
                });
                console.log(' - Generators: ', gens);
                var rows = this.context.rows;
                var data = [];
                for (var r = 0; r < rows; r++) {
                    data.push({ $id: r });
                }
                this._generators.forEach((gen) => {
                    // --------------------
                    if (gen.name in gens) {
                        console.log(' - Generating: ' + gen.name);
                        var res = gen.populate(rows, gens[gen.name]);
                        var i = 0;
                        while (i < res.length && i < data.length) {
                            angular.extend(data[i], res[i]);
                            i++;
                        }
                        console.log(' - Result: ' + gen.name, res);
                    }
                });

                this.context.resp = data;
                this.OnlineData.$save(this.context);
                this.busy = false;

                // Create and send the request
                /*
                var req = this.getArgs(this.context.rows, this.context.args);
                return this.fetch(req)
                    .then((data) => {
                        this.context.resp = data;
                        this.OnlineData.$save(this.context);
                    })
                    .catch((error) => {
                        this.error = error;
                    })
                    .finally(() => {
                        this.$rootScope.$applyAsync(() => {
                            this.busy = false;
                        });
                    });
                */
            } catch (ex) {
                this.error = ex;
            }
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
                    return this.test();
                }
            });
        }

        public removeProfile(profile: ISampleDataContext) {
            return this.OnlineData.$remove(profile);
        }

        public clearData(profile: ISampleDataContext) {
            profile.resp = null;
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
            return this.OnlineData.$save(profile);
        }

        public importColumns(profile: any, elems: any[]) {
            console.info(' - elems: ', elems);
            if (elems && elems.length) {
                elems.forEach((link) => {
                    link.click();
                });
            }
        }
    }

}  