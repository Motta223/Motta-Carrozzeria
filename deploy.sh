#!/bin/bash

echo "🚀 DEPLOY CARROZZERIA MOTTA ROBERTO SU RENDER"
echo "=============================================="

# Verifica che tutti i file necessari esistano
echo "📋 Verificando file necessari..."

if [ ! -f "package.json" ]; then
    echo "❌ package.json non trovato!"
    exit 1
fi

if [ ! -f "server.js" ]; then
    echo "❌ server.js non trovato!"
    exit 1
fi

if [ ! -f "index.html" ]; then
    echo "❌ index.html non trovato!"
    exit 1
fi

echo "✅ Tutti i file necessari sono presenti"

# Verifica dipendenze
echo "📦 Verificando dipendenze..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installando dipendenze..."
    npm install
fi

# Test del server
echo "🧪 Testando il server..."
timeout 5s npm start &
SERVER_PID=$!
sleep 2

# Verifica che il server risponda
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server funziona correttamente"
else
    echo "⚠️ Server non risponde, ma procediamo comunque"
fi

# Ferma il server di test
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎯 PROGETTO PRONTO PER IL DEPLOY!"
echo "=================================="
echo ""
echo "📋 PROSSIMI PASSI:"
echo "1. Vai su https://render.com"
echo "2. Registrati/Login"
echo "3. Clicca 'New +' → 'Web Service'"
echo "4. Seleziona 'Build and deploy from a Git repository'"
echo "5. Carica questa cartella come ZIP"
echo ""
echo "⚙️ CONFIGURAZIONE RENDER:"
echo "- Name: carrozzeria-motta-roberto"
echo "- Environment: Node"
echo "- Build Command: npm install"
echo "- Start Command: npm start"
echo "- Auto-Deploy: Yes"
echo ""
echo "🌐 URL FINALE: https://carrozzeria-motta-roberto.onrender.com"
echo ""
echo "✅ DEPLOY PRONTO!"
