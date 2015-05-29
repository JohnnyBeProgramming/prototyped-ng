@echo off

::run_unit_test
echo -------------------------------------------------------------------------------
echo - Running Unit Tests
echo -------------------------------------------------------------------------------
call npm test --loglevel silent & echo.
rem::call node Test.units.js

::run_e2e_test
start /B node Test.e2e.js
start /B webdriver-manager start --standalone --loglevel silent 2>nul 
call protractor tests/protractor.conf.js

::test_end
timeout 10 > nul