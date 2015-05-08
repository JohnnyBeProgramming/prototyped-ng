@echo off

::run_unit_test
call npm test

::run_e2e_test
call node Test.e2e.js

timeout 10