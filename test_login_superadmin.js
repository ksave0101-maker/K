const mysqlLib = require('mysql2');
const bcrypt = require('bcryptjs');
(async ()=>{
  try{
    const conn = mysqlLib.createConnection({host:'127.0.0.1', user:'ksystem', password:'Ksave2025Admin', database:'ksystem'}).promise();
    const [rows] = await conn.execute("SELECT userId,userName,password,typeID,site,email FROM user_list WHERE userName=? LIMIT 1", ['executive']);
    if (!rows || rows.length===0) { console.error('User not found'); process.exit(2); }
    const user = rows[0];
    const ok = await bcrypt.compare('Admin2026', user.password);
    console.log('userId:', user.userId);
    console.log('userName:', user.userName);
    console.log('email:', user.email);
    console.log('typeID:', user.typeID);
    console.log('site:', user.site);
    console.log('password match:', ok);
    conn.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
