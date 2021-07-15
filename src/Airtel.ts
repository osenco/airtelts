import axios from "axios"

export class Airtel {
 public client_id;
    public client_secret;
    public Client $client;
    protected public_key = '';
    protected token;
    protected country = 'KE';
    protected currency = 'KES';

      constructor(options = {}) {
            this.client = axios.create({
                  baseUrl: options.env == 'staging'
                    ? 'https://openapiuat.airtel.africa/'
                    : 'https://openapi.airtel.africa/'
            });
      }
      
protected authorize(token = null) {
const inputBody = '{
      "client_id": "*****************************",
      "client_secret": "*****************************",
      "grant_type": "client_credentials"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'*/*'
};

this.client.post('/auth/oauth2/token', inputBody,headers)
.then(function(res) {
    return res.data;

this.token = res.data.access_token,
});
return this
}
}
