const puppeteer = require('puppeteer');

async function testLogin() {
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Ascolta gli errori JavaScript
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ ERRORE JAVASCRIPT:', msg.text());
        } else {
            console.log('📝 Console:', msg.text());
        }
    });
    
    page.on('pageerror', error => {
        console.log('❌ ERRORE PAGINA:', error.message);
    });
    
    try {
        console.log('🌐 Navigando verso http://localhost:3001...');
        await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
        
        console.log('⏳ Aspetto che la pagina si carichi...');
        await page.waitForSelector('#loginForm', { timeout: 5000 });
        
        console.log('✅ Pagina caricata correttamente!');
        
        // Testa il login con admin/admin
        console.log('🔐 Testando login con admin/admin...');
        await page.type('#username', 'admin');
        await page.type('#password', 'admin');
        
        // Clicca il pulsante di login
        await page.click('button[type="submit"]');
        
        // Aspetta un po' per vedere se il login funziona
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Controlla se siamo nella dashboard
        const dashboardVisible = await page.$('#dashboard');
        if (dashboardVisible) {
            console.log('✅ Login riuscito! Dashboard visibile.');
        } else {
            console.log('❌ Login fallito. Dashboard non visibile.');
        }
        
        console.log('🔍 Mantengo il browser aperto per ispezione manuale...');
        console.log('Premi Ctrl+C per chiudere quando hai finito.');
        
        // Mantieni il browser aperto
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Errore durante il test:', error.message);
    }
}

testLogin().catch(console.error);