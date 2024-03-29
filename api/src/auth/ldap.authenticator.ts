// const { authenticate } = require('ldap-authentication')
const ldap = require('ldapjs');

const client = ldap.createClient({
  url: [process.env.LDAP_SERVER]
});

client.on('error', (err) => {
  console.log('Error connecting to LDAP server!');
  console.log(err);
  process.exit(1)
})

export async function authenticateLDAP(username: string, password: string) {
  return new Promise((resolve, reject) => {
    
    client.bind('', '', (err) => {
      /*
        LDAP error
      */
      if (err) reject(err);
      /*
        search for user?
      */
      const opts = {
        filter: `(uid=${username})`,
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn']
      };
      client.search('dc=upr,dc=si', opts, (err, res) => {
        let searchTriggered = false;
        /*
          LDAP error
        */
        if (err) reject(err);
        /*
         network error
        */
        res.on('searchEntry', (entry) => {
          searchTriggered = true;
          if (!entry.object) {
            reject("No user");
          }

          client.bind(`${entry.object.dn}`, password, (err) => {
            /*
              LDAP error
            */
            if (err) reject(err);
            
            resolve(entry.object)
          });
        });
        res.on('error', (err) => reject(err));
        res.on('end', err => {
          console.log("[AUTH] auth end: ", err);
          if (err && !searchTriggered) reject(err);
        });
      });
    });
  })
}
