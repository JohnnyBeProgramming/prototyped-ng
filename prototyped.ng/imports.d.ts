﻿/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />

interface Window {
    WhichBrowser: () => void;
    isNaN: (input: any) => boolean;
    isFinite: (input: any) => boolean;
}
declare var moment: any;
declare var process: any;
declare var require: (name: string) => any;
declare var openDatabase: (name: string, version: string, desc: string, size: number) => void;
declare var CodeMirror: any;