const { authenticate } = require('ldap-authentication')

export async function authenticateLDAP(username: string, password: string) {
  const options = {
    ldapOpts: {
      url: process.env.LDAP_SERVER,
      // tlsOptions: { rejectUnauthorized: false }
    },
    userDn: `uid=${username},dc=upr,dc=si`,
    userPassword: `${password}`,
    userSearchBase: 'dc=upr,dc=si',
    usernameAttribute: 'uid',
    username: `${username}`,
    // starttls: false
  }

  const user = await authenticate(options)
  console.log(user)
  return user;
}
