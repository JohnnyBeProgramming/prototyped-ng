if object_id(N'tempdb..[#TableSizes]') is not null
  drop table #TableSizes;
go
create table #TableSizes
(
    [Table Name] nvarchar(128)   
  , [Number of Rows] char(11)    
  , [Reserved Space] varchar(18) 
  , [Data Space] varchar(18)    
  , [Index Size] varchar(18)    
  , [Unused Space] varchar(18)  
);
go

declare @schemaname varchar(256) ;
set @schemaname = 'dbo' ;

declare curSchemaTable cursor
  for select sys.schemas.name + '.' + sys.objects.name
      from    sys.objects
    		, sys.schemas
      where   object_id > 100
    		  and sys.schemas.name = @schemaname
    		  and type_desc = 'USER_TABLE'
    		  and sys.objects.schema_id = sys.schemas.schema_id ;

open curSchemaTable ;
declare @name varchar(256) ;  

fetch curSchemaTable into @name;
while ( @@FETCH_STATUS = 0 )
  begin    
    insert into #TableSizes
    		exec sp_spaceused @objname = @name;       
    fetch curSchemaTable into @name;   
  end

close curSchemaTable;     
deallocate curSchemaTable;


select [Table Name]
      , [Number of Rows]
      , [Reserved Space]
      , [Data Space]
      , [Index Size]
      , [Unused Space]
from    [#TableSizes]
order by [Table Name];

drop table #TableSizes;