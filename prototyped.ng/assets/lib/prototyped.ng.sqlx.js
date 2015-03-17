angular.module('prototyped.ng.sql', []).run(['$templateCache', function($templateCache) { 
  'use strict';

  $templateCache.put('modules/features/sqlcmd.exe/scripts/utils/FileSizes.sql',
    "SELECT \r" +
    "\n" +
    "\tDB_NAME(database_id) AS DatabaseName,\r" +
    "\n" +
    "\tName AS Logical_Name,\r" +
    "\n" +
    "\tPhysical_Name, (size*8) SizeKB\r" +
    "\n" +
    "FROM \r" +
    "\n" +
    "\tsys.master_files\r" +
    "\n" +
    "WHERE \r" +
    "\n" +
    "\tDB_NAME(database_id) LIKE DB_NAME()"
  );


  $templateCache.put('modules/features/sqlcmd.exe/scripts/utils/ListViews.sql',
    "SELECT \r" +
    "\n" +
    "\tv.object_id  AS ObjectId,\r" +
    "\n" +
    "\tv.name  AS ViewName\r" +
    "\n" +
    "FROM sys.views  v \r" +
    "\n" +
    "WHERE v.is_ms_shipped = 0"
  );


  $templateCache.put('modules/features/sqlcmd.exe/scripts/utils/NoCounts.sql',
    "SET NOCOUNT ON;"
  );


  $templateCache.put('modules/features/sqlcmd.exe/scripts/utils/ShrinkDB.sql',
    "DECLARE @TargetDB varchar(max) SET @TargetDB = DB_NAME()\r" +
    "\n" +
    "DECLARE @InitialSize int\r" +
    "\n" +
    "\r" +
    "\n" +
    "-- Declare the temp table (used to hold info about DB sizes before and after shrink)\r" +
    "\n" +
    "IF OBJECT_ID(N'tempdb..[#TableSizes]') IS NOT NULL DROP TABLE #TableSizes \r" +
    "\n" +
    "CREATE TABLE #TableSizes ([Description] varchar(max), [TotalSize] int, [Reduction] decimal(18,2))\r" +
    "\n" +
    "INSERT INTO #TableSizes SELECT @TargetDB + ' ( before )', SUM(size), 0.00 FROM sys.database_files\r" +
    "\n" +
    "SELECT @InitialSize = [TotalSize] FROM #TableSizes\r" +
    "\n" +
    "\r" +
    "\n" +
    "/*\r" +
    "\n" +
    "-- Set recovery mode to 'Simple'\r" +
    "\n" +
    "ALTER DATABASE Zetes_IMS_Clean SET RECOVERY SIMPLE\r" +
    "\n" +
    "*/\r" +
    "\n" +
    "\r" +
    "\n" +
    "-- Shrink the DB files\r" +
    "\n" +
    "DECLARE @name varchar(max)\r" +
    "\n" +
    "DECLARE db_cursor CURSOR FOR \r" +
    "\n" +
    "SELECT name FROM sys.database_files WHERE state_desc = 'ONLINE'\r" +
    "\n" +
    "\r" +
    "\n" +
    "OPEN db_cursor  \r" +
    "\n" +
    "FETCH NEXT FROM db_cursor INTO @name  \r" +
    "\n" +
    "WHILE @@FETCH_STATUS = 0  \r" +
    "\n" +
    "BEGIN  \r" +
    "\n" +
    "\t   DBCC SHRINKFILE (@name, 1) WITH NO_INFOMSGS\r" +
    "\n" +
    "       \r" +
    "\n" +
    "       FETCH NEXT FROM db_cursor INTO @name  \r" +
    "\n" +
    "END  \r" +
    "\n" +
    "CLOSE db_cursor  \r" +
    "\n" +
    "DEALLOCATE db_cursor\r" +
    "\n" +
    "\r" +
    "\n" +
    "/*\r" +
    "\n" +
    "-- Set recovery mode to 'Full'\r" +
    "\n" +
    "ALTER DATABASE Zetes_IMS_Clean SET RECOVERY FULL\r" +
    "\n" +
    "*/\r" +
    "\n" +
    "\r" +
    "\n" +
    "-- Get the new DB size, and display the compared results\r" +
    "\n" +
    "INSERT INTO #TableSizes SELECT @TargetDB + ' ( after )', SUM(size), (100 * (@InitialSize - SUM(size)) / @InitialSize) FROM sys.database_files\r" +
    "\n" +
    "SELECT \r" +
    "\n" +
    "\t [Description]\r" +
    "\n" +
    "\t,REPLACE(CONVERT(varchar,CONVERT(Money, [TotalSize]),1),'.00','') AS [Size ( kb )]\r" +
    "\n" +
    "\t,[Reduction] AS [Reduced ( % )]\r" +
    "\n" +
    "FROM #TableSizes\r" +
    "\n" +
    "DROP TABLE #TableSizes"
  );


  $templateCache.put('modules/features/sqlcmd.exe/scripts/utils/TableSizes.sql',
    "if object_id(N'tempdb..[#TableSizes]') is not null\r" +
    "\n" +
    "  drop table #TableSizes;\r" +
    "\n" +
    "go\r" +
    "\n" +
    "create table #TableSizes\r" +
    "\n" +
    "(\r" +
    "\n" +
    "    [Table Name] nvarchar(128)   \r" +
    "\n" +
    "  , [Number of Rows] char(11)    \r" +
    "\n" +
    "  , [Reserved Space] varchar(18) \r" +
    "\n" +
    "  , [Data Space] varchar(18)    \r" +
    "\n" +
    "  , [Index Size] varchar(18)    \r" +
    "\n" +
    "  , [Unused Space] varchar(18)  \r" +
    "\n" +
    ");\r" +
    "\n" +
    "go\r" +
    "\n" +
    "\r" +
    "\n" +
    "declare @schemaname varchar(256) ;\r" +
    "\n" +
    "set @schemaname = 'dbo' ;\r" +
    "\n" +
    "\r" +
    "\n" +
    "declare curSchemaTable cursor\r" +
    "\n" +
    "  for select sys.schemas.name + '.' + sys.objects.name\r" +
    "\n" +
    "      from    sys.objects\r" +
    "\n" +
    "    \t\t, sys.schemas\r" +
    "\n" +
    "      where   object_id > 100\r" +
    "\n" +
    "    \t\t  and sys.schemas.name = @schemaname\r" +
    "\n" +
    "    \t\t  and type_desc = 'USER_TABLE'\r" +
    "\n" +
    "    \t\t  and sys.objects.schema_id = sys.schemas.schema_id ;\r" +
    "\n" +
    "\r" +
    "\n" +
    "open curSchemaTable ;\r" +
    "\n" +
    "declare @name varchar(256) ;  \r" +
    "\n" +
    "\r" +
    "\n" +
    "fetch curSchemaTable into @name;\r" +
    "\n" +
    "while ( @@FETCH_STATUS = 0 )\r" +
    "\n" +
    "  begin    \r" +
    "\n" +
    "    insert into #TableSizes\r" +
    "\n" +
    "    \t\texec sp_spaceused @objname = @name;       \r" +
    "\n" +
    "    fetch curSchemaTable into @name;   \r" +
    "\n" +
    "  end\r" +
    "\n" +
    "\r" +
    "\n" +
    "close curSchemaTable;     \r" +
    "\n" +
    "deallocate curSchemaTable;\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "select [Table Name]\r" +
    "\n" +
    "      , [Number of Rows]\r" +
    "\n" +
    "      , [Reserved Space]\r" +
    "\n" +
    "      , [Data Space]\r" +
    "\n" +
    "      , [Index Size]\r" +
    "\n" +
    "      , [Unused Space]\r" +
    "\n" +
    "from    [#TableSizes]\r" +
    "\n" +
    "order by [Table Name];\r" +
    "\n" +
    "\r" +
    "\n" +
    "drop table #TableSizes;"
  );

}]);