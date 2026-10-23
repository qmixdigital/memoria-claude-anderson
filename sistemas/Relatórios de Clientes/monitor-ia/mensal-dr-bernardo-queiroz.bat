@echo off
rem Rotina mensal do Dr. Bernardo Queiroz (agendada no Windows: dia 1 de cada mes, 8h).
rem Consulta as IAs, le Search Console e GA4 e gera resultados\relatorio-dr-bernardo-queiroz.html
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
if not exist logs mkdir logs
echo ===== %date% %time% ===== >> logs\mensal-dr-bernardo-queiroz.log
python monitor.py --cliente dr-bernardo-queiroz >> logs\mensal-dr-bernardo-queiroz.log 2>&1
python relatorio.py --cliente dr-bernardo-queiroz --dias 30 >> logs\mensal-dr-bernardo-queiroz.log 2>&1
echo fim %date% %time% >> logs\mensal-dr-bernardo-queiroz.log
