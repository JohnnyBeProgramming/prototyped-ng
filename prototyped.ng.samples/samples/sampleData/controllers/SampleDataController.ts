///<reference path="../../../imports.d.ts"/>
/// <reference path="../../../../typings/firebase/firebase.d.ts" />

module proto.ng.samples.data {

    export interface ISampleDataContext {
        name: string;
        rows: number;
        args: any[];
        resp?: any;
    }

    export class SampleDataController {

        public busy: boolean;
        public error: Error;
        public context: ISampleDataContext;
        public _new: ISampleDataContext;
        public OnlineConn: any;
        public OnlineData: any;

        constructor(private $rootScope: any, private $scope: any, private $state: any, private $stateParams: any, private $q: any, private $firebaseAuth: any, private $firebaseObject: any, private $firebaseArray: any, private appConfig: any) {
            this.init();
        }

        private init() {
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
            if (this.appConfig['sampleData'].defaults)
            {
                this.appConfig['sampleData'].defaults.forEach((itm) => {
                    this.addProfile(itm);
                });
            }             
        }

        private getArgs(): any {
            var data = {
                rows: this.context.rows,
            };
            this.context.args.forEach(function (obj) {
                if (obj.id) data[obj.id] = obj.val;
            });
            return data;
        }

        public test() {
            try {
                // Set busy flag
                this.busy = true;

                // Create and send the request
                var req = this.getArgs();
                this.fetch(req)
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

                // Define the request and response handlers
                console.debug(' - Requesting...');
            } catch (ex) {
                this.error = ex;
            }
        }

        public fetch(data) {
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
                this.error = new Error('Config setting "sampleData.fillText" is undefined.');
                deferred.reject(this.error);
            }

            return deferred.promise;
        }

        public addNew(item: ISampleDataContext) {
            if (!item || !item.name) return;
            return this.addProfile(item).then(() => {
                this._new = null;
            });
        }

        public addProfile(profile: ISampleDataContext) {
            return this.OnlineData.$add(profile);
        }

        public updateProfile(profile: ISampleDataContext) {
            return this.OnlineData.$save(profile);
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
    }

}  