@echo off
cls
set log=Events.log
set npm=C:\Program Files\nodejs\npm.cmd
set WAIT_TIME=2000
set BROWSER=iexplore.exe
echo ===============================================================================
echo  Clean Development Environment 
echo ===============================================================================
:init
echo /* -- [ Event log created ] --------------------------------------------------- */ > "%log%"
echo /* -- Source: %~dpnx0  			 */ >> "%log%"
echo /* -- Caller: %0 					 */ >> "%log%"
echo /* -- + Args: %* 					 */ >> "%log%"
echo /* -- Status: [ %errorlevel% /  ] ---------------------------------------- */ >> "%log%"


:cmd_delete
rem ++++++++ call grunt clean || goto error

:cmd_delete_logs
if exist "*.log" 		echo  - Deleting: Event Logs... 		    & timeout 1 > nul & del *.log /Q
if exist "bin" 			echo  - Deleting: Build Folder... 			& timeout 3 > nul & rmdir "bin" /S /Q > nul
if exist "../app" 		echo  - Deleting: Application Folders... 	& timeout 10 > nul & rmdir "../app" /S /Q > nul
if exist "node_modules"	echo  - Deleting: Module Dependencies... 	& timeout 30 > nul & rmdir "node_modules" /S /Q > nul

echo /* -- Returns [ %errorlevel% ] ----------------------------------------------- */ >> "%log%"
:cmd_delete_done


:done
del *.log /Q /F > nul
rem if %errorlevel% goto error
echo -------------------------------------------------------------------------------
echo  - The script has been run successfully
echo -------------------------------------------------------------------------------
goto close
:error
echo -------------------------------------------------------------------------------
echo  - Error : The script encountered one or more errors (level %errorlevel%)...
echo -------------------------------------------------------------------------------
:wait
pause
:close