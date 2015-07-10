@echo off
call npm start --silent
call node Compiler.js 
start chrome "%CD%\compiled\index.html"