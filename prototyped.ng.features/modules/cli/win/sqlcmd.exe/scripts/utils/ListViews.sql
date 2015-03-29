SELECT 
	v.object_id  AS ObjectId,
	v.name  AS ViewName
FROM sys.views  v 
WHERE v.is_ms_shipped = 0