// 🏢 CONFIGURAZIONE AZIENDALE MOTTA CAR & GO S.R.L.

const COMPANY_INFO = {
    // 🏢 Dati aziendali
    name: "Motta car & go S.R.L.",
    description: "Carrozzeria Officina Auto Moto",
    
    // 📍 Indirizzo
    address: {
        street: "Via Parini 3",
        city: "Barzanò",
        province: "LC",
        postalCode: "23891",
        fullAddress: "Via Parini 3, 23891 Barzanò (LC)"
    },
    
    // 📞 Contatti
    contacts: {
        phone: "348 933 6087",
        email: "ufficio.mottacar@gmail.com", // Corretto l'errore di battitura
        website: "www.mottacarandgo.it" // Opzionale
    },
    
    // 💼 Dati fiscali
    fiscal: {
        vatNumber: "04087480135",
        taxCode: "04087480135", // Solitamente uguale per S.R.L.
        sdiCode: "", // Codice destinatario fatturazione elettronica (se necessario)
        pec: "" // PEC aziendale (se disponibile)
    },
    
    // 🎨 Branding
    branding: {
        primaryColor: "#2c3e50",
        secondaryColor: "#3498db",
        accentColor: "#e74c3c",
        logoPath: "/assets/logo.jpeg", // Percorso logo nel sito
        logoAlt: "Motta car & go S.R.L. Logo"
    },
    
    // 💰 Tariffe standard
    rates: {
        laborHourly: 45.00, // €/ora manodopera
        diagnostics: 35.00, // €/ora diagnostica
        painting: 50.00,    // €/ora verniciatura
        bodywork: 45.00,    // €/ora lattoneria
        mechanics: 40.00,   // €/ora meccanica
        washing: 25.00      // €/ora lavaggio
    },
    
    // 📋 Condizioni standard preventivi
    estimateTerms: {
        validityDays: 30,
        paymentTerms: "Pagamento alla consegna",
        warranty: "Garanzia 12 mesi sui lavori effettuati",
        notes: [
            "I prezzi si intendono IVA esclusa",
            "Il preventivo è valido 30 giorni dalla data di emissione",
            "I lavori inizieranno solo dopo conferma scritta del cliente",
            "Eventuali lavori aggiuntivi saranno concordati preventivamente"
        ]
    },
    
    // 🏭 Reparti e specializzazioni
    departments: {
        verniciatura: {
            name: "Verniciatura",
            description: "Verniciatura auto e moto, ritocchi, carrozzeria",
            hourlyRate: 50.00
        },
        lattoneria: {
            name: "Lattoneria",
            description: "Riparazione danni, sostituzione parti, raddrizzatura",
            hourlyRate: 45.00
        },
        meccanica: {
            name: "Meccanica",
            description: "Riparazioni meccaniche, tagliandi, diagnostica",
            hourlyRate: 40.00
        },
        preparazione: {
            name: "Preparazione Verniciatura",
            description: "Preparazione superfici, carteggiatura, mascheratura",
            hourlyRate: 45.00
        },
        lavaggio: {
            name: "Lavaggio e Detailing",
            description: "Lavaggio, lucidatura, sanificazione interni",
            hourlyRate: 25.00
        }
    },
    
    // 📄 Template preventivo
    estimateTemplate: {
        header: {
            title: "PREVENTIVO",
            subtitle: "Riparazione Veicolo"
        },
        footer: {
            thankYou: "Grazie per averci scelto!",
            contact: "Per informazioni contattaci al 348 933 6087"
        }
    }
};

// 🧮 FUNZIONI CALCOLO PREVENTIVI
const EstimateCalculator = {
    // Calcola costo manodopera per reparto
    calculateLaborCost(department, hours) {
        const rate = COMPANY_INFO.departments[department]?.hourlyRate || COMPANY_INFO.rates.laborHourly;
        return hours * rate;
    },
    
    // Calcola IVA
    calculateVAT(amount, vatRate = 22) {
        return amount * (vatRate / 100);
    },
    
    // Calcola totale con IVA
    calculateTotal(subtotal, vatRate = 22) {
        const vat = this.calculateVAT(subtotal, vatRate);
        return {
            subtotal: subtotal,
            vat: vat,
            total: subtotal + vat
        };
    },
    
    // Genera numero preventivo
    generateEstimateNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
        
        return `PREV-${year}${month}${day}-${time}`;
    },
    
    // Calcola data scadenza preventivo
    calculateExpiryDate(validityDays = null) {
        const days = validityDays || COMPANY_INFO.estimateTerms.validityDays;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        return expiryDate;
    }
};

// 📄 GENERATORE PDF PREVENTIVO
const EstimatePDFGenerator = {
    // Genera HTML per preventivo
    generateHTML(estimate, client) {
        const totals = EstimateCalculator.calculateTotal(estimate.total_cost);
        const estimateNumber = estimate.estimate_number || EstimateCalculator.generateEstimateNumber();
        const expiryDate = EstimateCalculator.calculateExpiryDate();
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Preventivo ${estimateNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; }
                .company-details { font-size: 14px; color: #666; margin-top: 10px; }
                .estimate-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .client-info, .estimate-details { width: 45%; }
                .section-title { font-weight: bold; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .work-details { margin: 20px 0; }
                .costs-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .costs-table th, .costs-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .costs-table th { background-color: #f8f9fa; }
                .total-row { font-weight: bold; background-color: #e8f5e8; }
                .terms { margin-top: 30px; font-size: 12px; color: #666; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">${COMPANY_INFO.name}</div>
                <div class="company-details">
                    ${COMPANY_INFO.description}<br>
                    ${COMPANY_INFO.address.fullAddress}<br>
                    Tel: ${COMPANY_INFO.contacts.phone} | Email: ${COMPANY_INFO.contacts.email}<br>
                    P.IVA: ${COMPANY_INFO.fiscal.vatNumber}
                </div>
            </div>
            
            <div class="estimate-info">
                <div class="client-info">
                    <div class="section-title">CLIENTE</div>
                    <strong>${client.name}</strong><br>
                    ${client.address || ''}<br>
                    Tel: ${client.phone || 'N/A'}<br>
                    Email: ${client.email || 'N/A'}
                </div>
                <div class="estimate-details">
                    <div class="section-title">PREVENTIVO</div>
                    <strong>N. ${estimateNumber}</strong><br>
                    Data: ${new Date().toLocaleDateString('it-IT')}<br>
                    Valido fino: ${expiryDate.toLocaleDateString('it-IT')}<br>
                    Veicolo: ${estimate.vehicle}
                </div>
            </div>
            
            <div class="work-details">
                <div class="section-title">DESCRIZIONE LAVORI</div>
                <p>${estimate.description}</p>
                <p><strong>Reparto:</strong> ${COMPANY_INFO.departments[estimate.department]?.name}</p>
                <p><strong>Priorità:</strong> ${estimate.priority}</p>
            </div>
            
            <table class="costs-table">
                <thead>
                    <tr>
                        <th>Descrizione</th>
                        <th>Quantità</th>
                        <th>Prezzo Unitario</th>
                        <th>Totale</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Manodopera (${estimate.labor_hours} ore)</td>
                        <td>${estimate.labor_hours}</td>
                        <td>€ ${estimate.labor_rate.toFixed(2)}</td>
                        <td>€ ${estimate.labor_cost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Ricambi e materiali</td>
                        <td>1</td>
                        <td>€ ${estimate.parts_cost.toFixed(2)}</td>
                        <td>€ ${estimate.parts_cost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3"><strong>Subtotale (IVA esclusa)</strong></td>
                        <td><strong>€ ${totals.subtotal.toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="3">IVA 22%</td>
                        <td>€ ${totals.vat.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3"><strong>TOTALE (IVA inclusa)</strong></td>
                        <td><strong>€ ${totals.total.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="terms">
                <div class="section-title">CONDIZIONI</div>
                ${COMPANY_INFO.estimateTerms.notes.map(note => `<p>• ${note}</p>`).join('')}
                <p><strong>Pagamento:</strong> ${COMPANY_INFO.estimateTerms.paymentTerms}</p>
                <p><strong>Garanzia:</strong> ${COMPANY_INFO.estimateTerms.warranty}</p>
            </div>
            
            <div class="footer">
                <p>${COMPANY_INFO.estimateTemplate.footer.thankYou}</p>
                <p>${COMPANY_INFO.estimateTemplate.footer.contact}</p>
            </div>
        </body>
        </html>
        `;
    }
};

module.exports = {
    COMPANY_INFO,
    EstimateCalculator,
    EstimatePDFGenerator
};
