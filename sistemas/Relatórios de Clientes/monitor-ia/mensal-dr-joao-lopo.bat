@echo off
rem Rotina mensal do Dr. Joao Lopo (agendada no Windows: dia 1 de cada mes, 8h).
rem Consulta as IAs, le Search Console e GA4 e gera resultados\relatorio-dr-joao-lopo.html
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
if not exist logs mkdir logs
echo ===== %date% %time% ===== >> logs\mensal-dr-joao-lopo.log
python monitor.py --cliente dr-joao-lopo >> logs\mensal-dr-joao-lopo.log 2>&1
python relatorio.py --cliente dr-joao-lopo --dias 30 >> logs\mensal-dr-joao-lopo.log 2>&1
echo fim %date% %time% >> logs\mensal-dr-joao-lopo.log
