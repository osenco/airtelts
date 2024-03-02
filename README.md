# Airtel TypeScript SDK

This is the official TypeScript SDK for integrating with the Airtel API.

## Pre-requisites
- Create a Airtel money developer account: [https://developers.airtel.africa/user/signup](https://developers.airtel.africa/user/signup)
- Get your client id and client secret from the developer portal.
- If using the disbursements API, you will need to generate a public key and a PIN from the developer portal.

## Installation

### NPM

```bash
npm install @osenco/airtel
```

### Yarn

```bash
yarn add @osenco/airtel
```

### Pnpm

```bash
pnpm add @osenco/airtel
```

### Bun

```bash
bun add @osenco/airtel
```

## Usage

### Instantiate the SDK

```typescript
import { Airtel } from '@osenco/airtel';

const client_id =""
const client_secret = ""
const country = "KE"
const currency = "KES"
const env = "live"
const pin = ""
const public_key = ""
```
#### For collections API only
```typescript
const airtel = new Airtel(client_id, client_secret, country, currency, env);
```

#### If handling disbursements as well
```typescript
const airtel = new Airtel(client_id, client_secret, country, currency, env, pin, public_key);
```

### Generate Token

Use the `authorize` method to generate a token. The token is valid for 1 hour.

```typescript
await airtel.authorize();
```

### Send a USSD Request

Use the `prompt` method to send a USSD push to a customer to complete the payment by entering their PIN.

```typescript
try {
    const amount = 1000;
    const reference = '1234567890';
    const phone = '254732345678';

    airtel.authorize().then(({ prompt }) => {
        const res = prompt(phone, amount, reference)
        console.info(res);
    })

    // OR

    await airtel.authorize();
    const res = await airtel.prompt(phone, amount, reference);
    console.info(res);
} catch (error) {
    console.error(error);
}
```