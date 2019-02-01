
//
// fcns related to low level interaction w/ PLPToken contract
//
const common = require('./common');
const ether = require('./ether');
const ethtx = require('ethereumjs-tx');
const ethabi = require('ethereumjs-abi');
const Buffer = require('buffer/').Buffer;
const BN = require("bn.js");

const plpTokenEther = module.exports = {

    ropsten_contract_addr: '0xC5c37d2dA1659169f1a2d307cdb2EC5A03775E3e',
    kovan_contract_addr: [],
    main_contract_addr: [],
    contractInstance: null,
    withdrawDividendsABI: null,
    CONTRACT_ADDR: [],
    CONTRACT_ABI:
    '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFromReserve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"killContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"checkDividends","outputs":[{"name":"_amount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"reserveTokens","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawDividends","outputs":[{"name":"_amount","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"tokenHolders","outputs":[{"name":"tokens","type":"uint256"},{"name":"currentPoints","type":"uint256"},{"name":"lastSnapshot","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"trusted","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isLocked","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"reserve","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_trustedAddr","type":"address"}],"name":"setTrust","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"lock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"holdoverBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_totalSupply","type":"uint256"},{"name":"_reserveSupply","type":"uint256"},{"name":"_reserve","type":"address"},{"name":"_decimals","type":"uint8"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"PaymentEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"TransferEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"ApprovalEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]',


    // network = [ 'Mainnet' | 'Morden test network' | 'Ropsten test network' | 'Rinkeby test network' | 'Kovan test network' ]
    setNetwork: function(network) {
    	if (network.indexOf('Kovan') >= 0) {
	    plpTokenEther.CONTRACT_ADDR = plpTokenEther.kovan_contract_addr;
	} else if (network.indexOf('Ropsten') >= 0) {
	    plpTokenEther.CONTRACT_ADDR = plpTokenEther.ropsten_contract_addr;
	} else {
	    alert(network + ' is not a supported network');
	}
	console.log('setNetwork: plp token contract addr = ' + plpTokenEther.CONTRACT_ADDR.toString());
    },



    // cb(err, balanceBN)
    getBalance: function(address, cb) {
	if (!plpTokenEther.contractInstance)
	    initcontractInstance();
	console.log('getBalance: instance = ' + plpTokenEther.contractInstance);
	plpTokenEther.contractInstance.balanceOf(address, (err, resultObj) => {
	    console.log('getBalance: address = ' + address + ', err = ' + err + ', result = ' + resultObj.toString());
	    if (!!err) {
		cb(err, null);
		return;
	    }
	    const balanceBN = common.numberToBN(resultObj);
	    cb(err, balanceBN);
	});
    },


    // cb(err, balanceBN)
    getReserveTokens: function(cb) {
	if (!plpTokenEther.contractInstance)
	    initcontractInstance();
	console.log('getReserveTokens: instance = ' + plpTokenEther.contractInstance);
	plpTokenEther.contractInstance.reserveTokens((err, resultObj) => {
	    console.log('getReserveTokens: err = ' + err + ', result = ' + resultObj.toString());
	    if (!!err) {
		cb(err, null);
		return;
	    }
	    const balanceBN = common.numberToBN(resultObj);
	    cb(err, balanceBN);
	});
    },


    // cb(err, amountBN)
    checkDividends: function(address, cb) {
	if (!plpTokenEther.contractInstance)
	    initcontractInstance();
	console.log('checkDividends: instance = ' + plpTokenEther.contractInstance);
	plpTokenEther.contractInstance.checkDividends(address, (err, resultObj) => {
	    console.log('checkDividends: err = ' + err + ', result = ' + resultObj.toString());
	    if (!!err) {
		cb(err, null);
		return;
	    }
	    const amountBN = common.numberToBN(resultObj);
	    cb(err, amountBN);
	});
    },


    // cb(err, txid)
    withdrawDividends: function(cb) {
	const abiWithdrawDividendsFcn = plpTokenEther.abiEncodeWithdrawDividends();
        const sendData = "0x" + abiWithdrawDividendsFcn;
	console.log('withdrawDividends: sendData = ' + sendData);
	ether.send(plpTokenEther.CONTRACT_ADDR, 0, 'wei', sendData, 0, cb);
    },

    abiEncodeWithdrawDividends: function() {
	if (!plpTokenEther.withdrawDividendsABI)
	    plpTokenEther.withdrawDividendsABI = ethabi.methodID('withdrawDividends', [ ]).toString('hex');
	return(plpTokenEther.withdrawDividendsABI);
    },

};


function initcontractInstance() {
    console.log('initcontractInstance');
    const ABIArray = JSON.parse(plpTokenEther.CONTRACT_ABI);
    const contract = common.web3.eth.contract(ABIArray);
    plpTokenEther.contractInstance = contract.at(plpTokenEther.CONTRACT_ADDR);
}
