#!/usr/bin/env node

const { exec } = require('child_process');
const message = process.argv[2];

if (!message) {
  console.error('❌ Errore: Devi fornire un messaggio di commit');
  console.log('📝 Uso: pnpm commit "il tuo messaggio di commit"');
  process.exit(1);
}

console.log('🔄 Git add...');
exec('git add .', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Errore durante git add:', error);
    return;
  }
  
  console.log('💬 Git commit...');
  exec(`git commit -m "${message}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Errore durante git commit:', error);
      return;
    }
    console.log('✅ Commit creato con successo');
    
    console.log('🚀 Git push...');
    exec('git push -u origin main', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Errore durante git push:', error);
        return;
      }
      console.log('🎉 Push completato con successo!');
      console.log(`📦 Commit: "${message}"`);
    });
  });
});
