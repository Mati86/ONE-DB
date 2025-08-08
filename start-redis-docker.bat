@echo off
echo Starting Redis with GUI using Docker...
echo.
echo This will start:
echo - Redis server on port 6379
echo - Redis Commander GUI on http://localhost:8081
echo.
echo Press any key to continue...
pause >nul

docker-compose up -d

echo.
echo Redis is starting up...
echo.
echo Access Redis GUI at: http://localhost:8081
echo Redis server is available at: localhost:6379
echo.
echo To stop Redis, run: docker-compose down
echo.
pause 