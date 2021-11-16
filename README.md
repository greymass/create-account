Account Creation Library
=======

This library allows you to prompt the user to create and initialize an account using Anchor.

## Installation

The `@greymass/account-creation` package is distributed as a module on [npm](https://www.npmjs.com/package/@greymass/account-creation).

```
yarn add @greymass/account-creation
# or
npm install --save @greymass/account-creation
```

## Usage

```
import { AccountCreator } from '@greymass/account-creation'

// Initialize the account creator object
const accountCreator = new AccountCreator({
  supportedChains: [], // List of supported chains.
  scope: 'wallet', // A string representing the scope of the account creation.
  loginOnCreate: true, // Tells anchor to attach an identityProof on account creation.
  returnUrl: 'http://wallet.greymass.com', // Url to return the user to once the account is created.
})

// Open a popup window prompting the user to create an account.
const creationResult = await accountCreator.createAccount()

console.log(creationResult);
// {
//   status: 'success',     // Will be success if the account was created successfully.
//   actor: 'test.gm',      // Account name of the created account.
//   network: 'eos',        // Network where the account was created.
//   identity_proof: {...}  // Signed identity proof, proving that the created account is owned by the current user.
// }
```

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
