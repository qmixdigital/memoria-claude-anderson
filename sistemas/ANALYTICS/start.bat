@echo off
title GA4 Realtime Dashboard
echo Iniciando servidor na porta 5500...
echo Acesse: http://127.0.0.1:5500
echo.
echo Pressione Ctrl+C para encerrar.
echo.
start http://127.0.0.1:5500
npx http-server . -p 5500 -c-1
