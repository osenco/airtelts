# Airtel TypeScript SDK

This is the official TypeScript SDK for integrating with the Airtel API.

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

```typescript
import { Airtel } from '@osenco/airtel';

try {
    const airtel = new Airtel();

    const amount = 1000;
    const reference = '1234567890';
    const phone = '254732345678';
    const country = 'KE';
    const currency = 'KES';
    
    airtel.authorize().then(({prompt}) => {
        const res = prompt(phone, amount, reference, country, currency)
        console.log(res);
    })
    
} catch (error) {
    console.log(error);
}
```
