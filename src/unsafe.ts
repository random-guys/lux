import { createClient, Client, ClientSSLSecurity } from 'soap';
import { SSL_OP_NO_TLSv1_2 } from 'constants';

/**
 * Disable security during an operation. This is temporarily
 * used to get around issues with SOAP and security
 * @param runner operation that will use a soap client
 */
export async function unsafeRun<T>(runner: () => Promise<T>) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  let result = await runner();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined;
  return result;
}

/**
 * Create an insecure soap client.
 * @param url location of soap service
 */
export async function unsafeClient(url: string): Promise<Client> {
  return new Promise((resolve, reject) => {
    createClient(url, (err, client) => {
      if (err) return reject(err);
      client.setSecurity(
        new ClientSSLSecurity('', '', {
          rejectUnauthorized: false,
          strictSSL: false,
          secureOptions: SSL_OP_NO_TLSv1_2
        })
      );
      resolve(client);
    });
  });
}
