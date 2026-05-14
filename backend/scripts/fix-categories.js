const path = require('path');
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { CosmosClient } = require('@azure/cosmos');

async function fixCategories() {
  const client = new CosmosClient({ 
    endpoint: process.env.AZURE_COSMOS_ENDPOINT, 
    key: process.env.AZURE_COSMOS_KEY 
  });
  const container = client.database(process.env.AZURE_COSMOS_DATABASE).container('jupas_programmes');
  
  const categoryMap = {
    'Healthcare': 'medicine',
    'Health Sciences': 'medicine',
    'Health & Sports': 'medicine',
    'Health & Education': 'medicine',
    'Arts & Humanities': 'arts',
    'Science': 'science',
    'Social Sciences': 'social_science',
    'Engineering': 'engineering',
    'Business': 'business'
  };
  
  // Query all programmes
  const { resources } = await container.items.query({ 
    query: 'SELECT * FROM c WHERE c.type = "programme"' 
  }).fetchAll();
  
  console.log(`Found ${resources.length} programmes to check\n`);
  
  for (const item of resources) {
    const newCat = categoryMap[item.category];
    if (newCat && newCat !== item.category) {
      item.category = newCat;
      await container.items.upsert(item);
      console.log('✅ Updated', item.code, item.nameEn || item.nameZh || '', '->', newCat);
    } else {
      console.log('⏭️  Skipped', item.code, '(already', item.category + ')');
    }
  }
  
  console.log('\n🎉 Category fix complete!');
}

fixCategories().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
