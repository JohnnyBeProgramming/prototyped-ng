/// <reference path="../../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../../typings/karma-jasmine/karma-jasmine.d.ts" />

describe('Calculator ', function () {

    it('should add two numbers correctly', function () {
        expect(1 + 1).toEqual(2);
    });

    it('should subtract two numbers correctly', function () {
        expect(1 - 1).toEqual(0);
    });

    it('should add negative numbers', function () {
        expect(1 - -1).toEqual(2);
    });

    it('should reject non numbers', function () {
        expect(1 + NaN).toBe(NaN);
    });

});
