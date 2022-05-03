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

This function will automatically open a popup window prompting the user to buy an account. Once the payment is received,
the account will be redirected to Anchor with an account creation code. Anchor is then expected to send a confirmation or
error message back before sending the user back to the defined url.

```
import { AccountCreator } from '@greymass/account-creation'

// Initialize the account creator object
const accountCreator = new AccountCreator({
  supportedChains: [], // List of supported chains.
  scope: 'wallet', // A string representing the scope of the account creation.
  returnUrl: 'http://wallet.greymass.com', // Url to return the user to once the account is created.
})

// Open a popup window prompting the user to create an account.
const creationResult = await accountCreator.createAccount().catch((error) => {
  // Handle error
})

console.log(creationResult);
// {
//   status: 'success',     // Will be success if the account was created successfully.
//   actor: 'test.gm',      // Account name of the created account.
//   network: '...',        // Chain id of the network where the account was created.
//   identity_proof: {...}  // Signed identity proof, proving that the created account is owned by the current user.
// }
```

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
