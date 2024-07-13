## Metacrafters ATM

### Description

The Metacrafters ATM smart contract provides essential functionalities for managing Ethereum deposits, withdrawals, transfers, and balance lookups. It is integrated into frontend REACT JS applications, allowing users to interact with their Ethereum balances.

### Getting Started

### Installing

To set up and interact with this contract using Hardhat, Node js (react import) , and VSCode, follow these steps:
* Setup Node JS on your project folder using
```
npm init
```
* Initialize Hardhat in your project folder with
```
npx hardhat
```
* Download or copy the following codes in your respective contracts/.sol, pages/index.js, and scripts/deploy.js file
* Configure your hardhat.config.js or follow what I used
```
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
};
```
### Executing program

* Open two additional terminals in your VS code
* In the first terminal type: `npx hardhat node`
* In the second terminal, type: `npx hardhat run --network localhost scripts/deploy.js`
* In the same terminal, run: `npm run dev`
* Then just open your browser on http://localhost:3000/

### Help
For common problems or issues, consider the following tips:
* Check that you have the correct address that you want to transfer ETH on.
* Make sure to setup your Metamask properly, and check if your on the right test account.
* Try clearing tab data on Metamask setting reset transaction data.
* If errors occur on regarding values being transacted, lines of error might show up due to the use of error handling.

## Authors

Contributors names and contact info

https://github.com/dylmn

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

