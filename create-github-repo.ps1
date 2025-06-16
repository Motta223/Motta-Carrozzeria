# 🚀 Script PowerShell per creare repository GitHub e fare deploy

Write-Host "🚀 CREAZIONE REPOSITORY GITHUB E DEPLOY SU RENDER" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Verifica che Git sia configurato
Write-Host "📋 Verificando configurazione Git..." -ForegroundColor Yellow

$gitUser = git config user.name
$gitEmail = git config user.email

if (-not $gitUser -or -not $gitEmail) {
    Write-Host "⚠️ Git non è configurato. Configurazione automatica..." -ForegroundColor Yellow
    git config user.name "Carrozzeria Motta Roberto"
    git config user.email "info@carrozzeria-motta.it"
    Write-Host "✅ Git configurato" -ForegroundColor Green
}

# Verifica repository Git
if (-not (Test-Path ".git")) {
    Write-Host "📁 Inizializzando repository Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repository Git inizializzato" -ForegroundColor Green
}

# Aggiungi tutti i file
Write-Host "📦 Aggiungendo file al repository..." -ForegroundColor Yellow
git add .

# Verifica se ci sono modifiche da committare
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Creando commit..." -ForegroundColor Yellow
    git commit -m "🚀 Deploy Ready - Carrozzeria Motta Roberto Sistema Gestionale

✅ Sistema Multi-Utente con ruoli Manager/Dipendenti
✅ Dashboard Reparti con Timer Operatori  
✅ Gestione Lavori con Stati Dinamici
✅ Upload Foto Multiple per Lavoro
✅ Gestione Ricambi con Calcolo Costi
✅ Server Express Ottimizzato per Produzione
✅ Responsive Design Mobile-First
✅ Persistenza Dati localStorage
✅ Security Headers e Performance

Ready for Render deployment!"
    Write-Host "✅ Commit creato" -ForegroundColor Green
} else {
    Write-Host "✅ Repository già aggiornato" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 REPOSITORY LOCALE PRONTO!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PROSSIMI PASSI PER GITHUB:" -ForegroundColor Cyan
Write-Host "1. Vai su https://github.com/new" -ForegroundColor White
Write-Host "2. Nome repository: carrozzeria-motta-roberto" -ForegroundColor White
Write-Host "3. Descrizione: Sistema Gestionale Carrozzeria Motta Roberto" -ForegroundColor White
Write-Host "4. Pubblico o Privato (a tua scelta)" -ForegroundColor White
Write-Host "5. NON inizializzare con README (abbiamo già i file)" -ForegroundColor White
Write-Host "6. Clicca Create repository" -ForegroundColor White
Write-Host ""
Write-Host "🔗 COMANDI PER COLLEGARE A GITHUB:" -ForegroundColor Cyan
Write-Host "git remote add origin https://github.com/TUO-USERNAME/carrozzeria-motta-roberto.git" -ForegroundColor Yellow
Write-Host "git branch -M main" -ForegroundColor Yellow
Write-Host "git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 DEPLOY SU RENDER:" -ForegroundColor Cyan
Write-Host "1. Vai su https://render.com" -ForegroundColor White
Write-Host "2. Connetti il repository GitHub" -ForegroundColor White
Write-Host "3. Deploy automatico!" -ForegroundColor White
Write-Host ""
Write-Host "✅ TUTTO PRONTO PER IL DEPLOY!" -ForegroundColor Green
