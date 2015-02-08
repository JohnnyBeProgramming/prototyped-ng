SELECT 
	DB_NAME(database_id) AS DatabaseName,
	Name AS Logical_Name,
	Physical_Name, (size*8) SizeKB
FROM 
	sys.master_files
WHERE 
	DB_NAME(database_id) LIKE DB_NAME()