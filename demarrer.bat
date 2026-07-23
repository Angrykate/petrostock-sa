@echo off
title PetroStock SA - Lancement
echo ========================================
echo    PetroStock SA - Demarrage des serveurs
echo ========================================
echo.

:: On lance le backend et le frontend dans des fenêtres séparées
:: Note : utiliser & au lieu de && car cmd /k ne supporte pas &&

echo [1/2] Demarrage du backend (port 8000)...
start "PetroStock Backend" cmd /k "cd /d C:\Users\USER\Documents\Projet\ProjetDeStage & .venv\Scripts\activate & python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo Attente du demarrage du backend (5 secondes)...
timeout /t 5 /nobreak >nul

echo [2/2] Demarrage du frontend (port 8443)...
start "PetroStock Frontend" cmd /k "cd /d C:\Users\USER\Documents\Projet\ProjetDeStage\frontend & npm run dev"

echo.
echo ========================================
echo    Les serveurs sont en cours de demarrage
echo.
echo    Backend  : http://localhost:8000
echo    Frontend : http://localhost:8443
echo    API Docs : http://localhost:8000/docs
echo ========================================
echo.
pause