# pirate-lottery

## Introduction

Pirate Lottery is a decentralized lottery that runs completely on the Ethereum blockchain. The entire operation of the lottery is controlled by an Ethereum smart contract. It is designed to operate with no backend server to adjusting the lottery parameters, such as ticket price, or maximum number of tickets. It also does not require a backend server or oracle to generate random numbers.

## Operation

During each round of a lottery people can purchase tickets for the posted ticket price, as long as the round is open. Once the maximum number of tickets have been purchased the round is closed. If the round has been open longer than its maximum duration, then regardless of the number of tickets sold, the next ticket purchased closes the round.

*After* a lottery round is closed the winner of the *previous* round can claim their prize.  *After* the prize of the *previous* round is claimed, the winner of the *current* round is selected. And once the winner is selected, the next round of the lottery is opened. The duration timer starts when the first ticket of the new round is purchased.

One of the challenges in creating a lottery program that runs on the Ethereum blockchain is that Ethereum has no native random-number-generator. The basic reason for this is that no matter what algorithm is used to generate a random number, the algorithm can be run before the next Ethereum block is mined, and thus the number can be known ahead-of-time.

Other games-of-chance that run on the Ethereum blockchain either use an outside source for random numbers (an oracle), or they use something that could actually be known to a hacker ahead-of-time (such as the block hash of the previously mined block).

In order to get around the random number challenge, Pirate Lottery uses information that is completely on-chain, but
 1. not known while a round is open and
 2. not change-able after a round is closed:

A hash, called the `player-hash` is created from the addresses of all the ticket purchasers. the final input to the hash is the hash of the miner who mines the Ethereum block that closes the round. Thus this hash cannot be known to any ticket purchaser while the round is open. The final bit of data that goes into the selection of the winner of the round is that in order to claim his prize, the winner of the *previous* round needs to sign a message that contains the player-hash of the current (closed) round. This signature is used to select a random winner of the current round.

Note that no player purchasing tickets for a given round has sufficient data to compute the the player-hash, because the player-hash includes the address of the miner who mines the block that closes the round. Also the miner who mines the block cannot know or meaningfully impact the selection of the winner of the current round, because he does not know the signature of the winner of the previous round.

## EIP712

The claim message that the previous winner signs conforms to the EIP712 signature standard. The message contains:
 - the name of the application (`"Pirate Lottery"`)
 - the name of the particular lottery (eg. `"Buried Treasure"`)
 - the round that was won
 - the winning ticket number
 - Version (`"1"`)
 - ChainId (Integer marking current chain, e.g. 1 for mainnet, 3 for Ropsten)
 - Contract Address (Address of the specific lottery contract instance)

## Building

* `Install browserfy`
* `npm install`
* `make`
* `cp -R build/* /var/web/html/`

To make a deployable version

* `make deploy`
