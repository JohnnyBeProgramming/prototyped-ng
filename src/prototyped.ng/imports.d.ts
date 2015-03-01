/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />

declare var process: any;
interface Window {
    WhichBrowser: () => void;
}
declare var openDatabase: (name: string, version: string, desc: string, size: number) => void;
