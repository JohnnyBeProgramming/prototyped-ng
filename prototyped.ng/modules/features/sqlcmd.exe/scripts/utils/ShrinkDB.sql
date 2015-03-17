DECLARE @TargetDB varchar(max) SET @TargetDB = DB_NAME()
DECLARE @InitialSize int

-- Declare the temp table (used to hold info about DB sizes before and after shrink)
IF OBJECT_ID(N'tempdb..[#TableSizes]') IS NOT NULL DROP TABLE #TableSizes 
CREATE TABLE #TableSizes ([Description] varchar(max), [TotalSize] int, [Reduction] decimal(18,2))
INSERT INTO #TableSizes SELECT @TargetDB + ' ( before )', SUM(size), 0.00 FROM sys.database_files
SELECT @InitialSize = [TotalSize] FROM #TableSizes

/*
-- Set recovery mode to 'Simple'
ALTER DATABASE Zetes_IMS_Clean SET RECOVERY SIMPLE
*/

-- Shrink the DB files
DECLARE @name varchar(max)
DECLARE db_cursor CURSOR FOR 
SELECT name FROM sys.database_files WHERE state_desc = 'ONLINE'

OPEN db_cursor  
FETCH NEXT FROM db_cursor INTO @name  
WHILE @@FETCH_STATUS = 0  
BEGIN  
	   DBCC SHRINKFILE (@name, 1) WITH NO_INFOMSGS
       
       FETCH NEXT FROM db_cursor INTO @name  
END  
CLOSE db_cursor  
DEALLOCATE db_cursor

/*
-- Set recovery mode to 'Full'
ALTER DATABASE Zetes_IMS_Clean SET RECOVERY FULL
*/

-- Get the new DB size, and display the compared results
INSERT INTO #TableSizes SELECT @TargetDB + ' ( after )', SUM(size), (100 * (@InitialSize - SUM(size)) / @InitialSize) FROM sys.database_files
SELECT 
	 [Description]
	,REPLACE(CONVERT(varchar,CONVERT(Money, [TotalSize]),1),'.00','') AS [Size ( kb )]
	,[Reduction] AS [Reduced ( % )]
FROM #TableSizes
DROP TABLE #TableSizes