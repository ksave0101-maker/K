const mysql = require('mysql2/promise');
const fs = require('fs');

async function restoreUserList() {
  let connection;
  
  try {
    console.log('🔄 Restoring user_list table...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'ksystem',
      password: 'Ksave2025Admin',
      database: 'ksystem',
      connectTimeout: 10000
    });
    
    console.log('✅ Connected to database');
    
    // Read SQL file
    const sql = fs.readFileSync('restore_user_list.sql', 'utf8');
    
    // Split SQL commands and execute them
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Executing:', command.trim().substring(0, 50) + '...');
        await connection.execute(command.trim() + ';');
      }
    }
    
    console.log('✅ user_list table restored successfully\!');
    
  } catch (error) {
    console.error('❌ Error restoring user_list:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

restoreUserList();
