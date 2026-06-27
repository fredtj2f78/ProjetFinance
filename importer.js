// Exécutez au  préalable : npm install dotenv @supabase/supabase-js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Il va chercher vos clés directement dans votre fichier .env.local !
const supabase = createClient("https://cqmqzrrpmnwfyvhreual.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbXF6cnJwbW53Znl2aHJldWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NjYxMSwiZXhwIjoyMDk1MDQyNjExfQ.JRk0MANq8qS__yqMgQ_0PZoWwBDkfo_viKa9sqBkg-o"
);

// Remplacer par l'UID copié depuis Supabase
const USER_ID = "e14ab267-7d71-41d3-bc38-832cf05128a7";
async function lancerImport() {
  try {
    const text = fs.readFileSync('linxo.csv', 'utf-8');
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    
    const firstLine = lines[0];
    let separator = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') ? ';' : ',');
    const headers = firstLine.split(separator).map(h => h.trim());

    const formattedData = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim());
      if (values.length !== headers.length) continue; 

      const row = {};
      headers.forEach((header, index) => { row[header] = values[index] || ''; });

      const rawAmount = row['Montant'] ? String(row['Montant']).replace(/\s/g, '').replace(',', '.') : '0';
      const parsedAmount = parseFloat(rawAmount);

      // LE CORRECTIF : On découpe la date JJ/MM/AAAA et on la remonte en AAAA-MM-JJ
      let dateSupabase = null;
      if (row['Date'] && row['Date'].includes('/')) {
        const [jour, mois, annee] = row['Date'].split('/');
        dateSupabase = `${annee}-${mois}-${jour}`;
      }

      formattedData.push({
        user_id: USER_ID,
        bank_transaction_id: `local_${Date.now()}_${i}`,
        account_name: row['Nom du compte'] || 'Compte Inconnu',
        date: dateSupabase, // On envoie la date convertie
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        raw_label: row['Libellé'] || '',
        category: row['Catégorie'] || 'Inconnue',
      });
    }

    const { error } = await supabase.from('transactions').insert(formattedData);

    if (error) console.error("❌ Erreur :", error);
    else console.log(`✅ Succès ! ${formattedData.length} transactions importées.`);
  } catch (err) {
    console.error("Erreur :", err.message);
  }
}

lancerImport();
