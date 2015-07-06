@echo off
call node Compiler.js & start chrome "%CD%\compiled\index.html"