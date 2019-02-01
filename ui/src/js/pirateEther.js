
//
// fcns related to ethereum and low level interaction w/ PirateLottery contract
//
const common = require('./common');
const ether = require('./ether');
const ethtx = require('ethereumjs-tx');
const ethabi = require('ethereumjs-abi');
const Buffer = require('buffer/').Buffer;
const BN = require("bn.js");
const keccak = require('keccakjs');

const pirateEther = module.exports = {

    ropsten_contract_addrs: [ '0xeaf9650FFc51Db69C6C335C272BC817e63dba952', '0xA1407f2b9eBAA5303ab2a4ab405a122277BB99c3' ],
    kovan_contract_addrs: [],
    main_contract_addrs: [],
    contractInstances: [],
    lotteryNames: [],
    buyTicketABI: null,
    claimPrizeABI: null,
    chainId: 0,
    CONTRACT_ADDRS: [],
    CONTRACT_ABI:
    '[{"constant":false,"inputs":[{"name":"_sigV","type":"uint8"},{"name":"_sigR","type":"bytes32"},{"name":"_sigS","type":"bytes32"},{"name":"_ticket","type":"uint256"}],"name":"claimPrize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenHoldoverBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"redeemPlpPoints","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"max_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"roundCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_plpToken","type":"address"}],"name":"setToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"killContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"},{"name":"_round","type":"uint256"},{"name":"_startIdx","type":"uint256"},{"name":"_maxResults","type":"uint256"}],"name":"getTickets","outputs":[{"name":"_idx","type":"uint256"},{"name":"_tickets","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_round","type":"uint256"},{"name":"_ticket","type":"uint256"}],"name":"getTicketOwner","outputs":[{"name":"_owner","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"PlpPoints","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"getCurrentInfo","outputs":[{"name":"_round","type":"uint256"},{"name":"_playerTicketCount","type":"uint256"},{"name":"_ticketPrice","type":"uint256"},{"name":"_ticketCount","type":"uint256"},{"name":"_begDate","type":"uint256"},{"name":"_endDate","type":"uint256"},{"name":"_prize","type":"uint256"},{"name":"_isOpen","type":"bool"},{"name":"_maxTickets","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"rounds","outputs":[{"name":"maxTickets","type":"uint256"},{"name":"ticketPrice","type":"uint256"},{"name":"ticketCount","type":"uint256"},{"name":"playersHash","type":"bytes32"},{"name":"begDate","type":"uint256"},{"name":"endDate","type":"uint256"},{"name":"winner","type":"uint256"},{"name":"prize","type":"uint256"},{"name":"isOpen","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isLocked","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawRetainedFees","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sigV","type":"uint8"},{"name":"_sigR","type":"bytes32"},{"name":"_sigS","type":"bytes32"},{"name":"_ticket","type":"uint256"}],"name":"claimAbondonedPrize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"min_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"closeRound","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"getPreviousInfo","outputs":[{"name":"_round","type":"uint256"},{"name":"_playerTicketCount","type":"uint256"},{"name":"_ticketPrice","type":"uint256"},{"name":"_ticketCount","type":"uint256"},{"name":"_begDate","type":"uint256"},{"name":"_endDate","type":"uint256"},{"name":"_prize","type":"uint256"},{"name":"_winningTicket","type":"uint256"},{"name":"_winner","type":"address"},{"name":"_claimDeadline","type":"uint256"},{"name":"_playersHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buyTicket","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"lock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_plpToken","type":"address"},{"name":"_chainId","type":"uint256"},{"name":"_name","type":"string"},{"name":"_min_ticket_price","type":"uint256"},{"name":"_max_ticket_price","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"claimHash","type":"bytes32"},{"indexed":false,"name":"recovered","type":"address"}],"name":"DebugEvent0","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"V","type":"uint8"},{"indexed":false,"name":"R","type":"bytes32"},{"indexed":false,"name":"S","type":"bytes32"},{"indexed":false,"name":"ticket","type":"uint256"}],"name":"DebugEvent1","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"round","type":"uint256"},{"indexed":false,"name":"ticket","type":"uint256"},{"indexed":false,"name":"prize","type":"uint256"}],"name":"WinnerEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"round","type":"uint256"},{"indexed":false,"name":"payee","type":"address"},{"indexed":false,"name":"prize","type":"uint256"},{"indexed":false,"name":"payout","type":"uint256"}],"name":"PayoutEvent","type":"event"}]',


    // network = [ 'Mainnet' | 'Morden test network' | 'Ropsten test network' | 'Rinkeby test network' | 'Kovan test network' ]
    setNetwork: function(network) {
    	if (network.indexOf('Kovan') >= 0) {
	    pirateEther.CONTRACT_ADDRS = pirateEther.kovan_contract_addrs;
	    pirateEther.chainId = 42;
	} else if (network.indexOf('Ropsten') >= 0) {
	    pirateEther.CONTRACT_ADDRS = pirateEther.ropsten_contract_addrs;
	    pirateEther.chainId = 3;
	} else {
	    alert(network + ' is not a supported network');
	}
	console.log('setNetwork: pirate contract addrs = ' + pirateEther.CONTRACT_ADDRS.toString());
    },

    // cb(err, name)
    getName: function(lottery, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	if (!!pirateEther.lotteryNames[lotteryIdx]) {
	    cb(null, pirateEther.lotteryNames[lotteryIdx]);
	    return;
	}
	console.log('getName(' + lottery + '): lotteryIdx = ' + lotteryIdx);
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	pirateEther.contractInstances[lotteryIdx].name((err, resultObj) => {
	    console.log('getName(' + lottery + '): name = ' + resultObj.toString());
	    if (!!err) {
		cb(err, null);
		return;
	    }
	    pirateEther.lotteryNames[lotteryIdx] = resultObj.toString();
	    cb(err, pirateEther.lotteryNames[lotteryIdx]);
	});
    },


    // cb(err, balanceBN)
    getBalance: function(lottery, address, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	console.log('getBalance(' + lottery + '): lotteryIdx = ' + lotteryIdx);
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	console.log('getBalance(' + lottery + '): instance = ' + pirateEther.contractInstances[lotteryIdx]);
	pirateEther.contractInstances[lotteryIdx].balances(address, (err, resultObj) => {
	    console.log('getBalance(' + lottery + '): address = ' + address + ', err = ' + err + ', result = ' + resultObj.toString());
	    if (!!err) {
		cb(err, null);
		return;
	    }
	    const balanceBN = common.numberToBN(resultObj);
	    cb(err, balanceBN);
	});
    },


    // cb(err, pointsBN)
    getPlpPoints: function(lottery, address, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	console.log('getPlpPoints(' + lottery + '): lotteryIdx = ' + lotteryIdx);
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	console.log('getPlpPoints(' + lottery + '): instance = ' + pirateEther.contractInstances[lotteryIdx]);
	pirateEther.contractInstances[lotteryIdx].PlpPoints(address, (err, resultObj) => {
	    console.log('getPlpPoints(' + lottery + '): address = ' + address + ', err = ' + err + ', result = ' + resultObj.toString());
	    if (!!err) {
		cb(err, null);
		return;
	    }
	    const pointsBN = common.numberToBN(resultObj);
	    cb(err, pointsBN);
	});
    },


    // cb(err, pointsBN)
    redeemPlpPoints: function(lottery, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	console.log('redeemPlpPoints(' + lottery + '): lotteryIdx = ' + lotteryIdx);
	const abiRedeemPlpPointsFcn = pirateEther.abiEncodeRedeemPlpPoints();
        const sendData = "0x" + abiRedeemPlpPointsFcn;
	ether.send(pirateEther.CONTRACT_ADDRS[lotteryIdx], 0, 'wei', sendData, 0, cb);
    },

    abiEncodeRedeemPlpPoints: function() {
	//no parms
	if (!pirateEther.buyTicketABI)
	    pirateEther.buyTicketABI = ethabi.methodID('redeemPlpPoints', [ ]).toString('hex');
	return(pirateEther.buyTicketABI);
    },


    // cb(err, currentInfo)
    // currentInfo = { round, playerTicketCount, ticketPrice, ticketCount, begDate, endDate, prize, isOpen, maxTickets }
    //
    //   function getCurrentInfo(address _addr) public view returns(uint256 _round, uint256 _playerTicketCount, uint256 _ticketPrice, uint256 _ticketCount,
    //                                                              uint256 _begDate, uint256 _endDate, uint256 _prize,
    //                                                              bool _isOpen, uint256 _maxTickets);
    //
    getCurrentInfo: function(lottery, address, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	console.log('getCurrentInfo(' + lottery + '): lotteryIdx = ' + lotteryIdx);
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	console.log('getCurrentInfo(' + lottery + '): contractInstance = ' + pirateEther.contractInstances[lotteryIdx]);
	pirateEther.contractInstances[lotteryIdx].getCurrentInfo(address, (err, resultObj) => {
	    console.log('getCurrentInfo(' + lottery + '): result = ' + resultObj);
	    const currentInfo = {};
	    if (!err) {
		const keys = [ 'round', 'playerTicketCount', 'ticketPrice', 'ticketCount', 'begDate', 'endDate', 'prize', 'isOpen', 'maxTickets' ];
		const resultArray = Array.from(resultObj);
		for (let i = 0; i < resultArray.length; ++i)
		    currentInfo[keys[i]] = (resultArray[i] == 'false') ? false :
		                           (resultArray[i] == 'true' ) ? true  : resultArray[i];
	    }
	    console.log('getCurrentInfo(' + lottery + '): ' + JSON.stringify(currentInfo));
	    cb(err, currentInfo);
	});
    },


    // cb(err, previousInfo)
    // previousInfo = { round, playerTicketCount, ticketPrice, ticketCount,
    //                  begDate, endDate, prize,
    //                  winningTicket, winner, claimDeadline, message }
    //
    //    function getPreviousInfo(address _addr) public view returns(uint256 _round, uint256 _playerTicketCount, uint256 _ticketPrice, uint256 _ticketCount,
    //                                                                uint256 _begDate, uint256 _endDate, uint256 _prize,
    //                                                                uint256 _winningTicket, address _winner, uint256 _claimDeadline, bytes32 _playerHash);
    //
    getPreviousInfo: function(lottery, address, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	pirateEther.contractInstances[lotteryIdx].getPreviousInfo(address, (err, resultObj) => {
	    console.log('getPreviousInfo(' + lottery + '): result = ' + resultObj);
	    const previousInfo = {};
	    if (!err) {
		const keys = [ 'round', 'playerTicketCount', 'ticketPrice', 'ticketCount', 'begDate', 'endDate', 'prize',
			       'winningTicket', 'winner', 'claimDeadline', 'playerHash' ];
		const resultArray = Array.from(resultObj);
		for (let i = 0; i < resultArray.length; ++i)
		    previousInfo[keys[i]] = resultArray[i];
	    }
	    console.log('getPreviousInfo(' + lottery + '): ' + JSON.stringify(previousInfo));
	    cb(err, previousInfo);
	});
    },

    // cb(err, lastIdx, tickets[])
    //
    //    function getTickets(address _addr, uint256 _round, uint256 _startIdx, uint256 _maxResults) public view
    //                        returns(uint256 _idx, uint256[] memory _tickets);
    //
    //
    getTickets: function (lottery, address, round, startIdxBN, maxResults, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	pirateEther.contractInstances[lotteryIdx].getTickets(address, common.numberToHex256(round), common.BNToHex256(startIdxBN),
							    common.numberToHex256(maxResults), (err, result) => {
	    console.log('getTickets(' + lottery + '): err = ' + err + ', result = ' + result);
	    const tickets = result.toString().split(",");
	    //first entry is idx of last msgId
	    const lastIdx = tickets.shift();
	    cb(err, lastIdx, tickets);
	});
    },


    // cb(err, txid)
    buyTicket: function(lottery, priceWei, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	const abiBuyTicketFcn = pirateEther.abiEncodeBuyTicket();
        const sendData = "0x" + abiBuyTicketFcn;
	ether.send(pirateEther.CONTRACT_ADDRS[lotteryIdx], priceWei, 'wei', sendData, 0, cb);
    },

    abiEncodeBuyTicket: function() {
	//no parms
	if (!pirateEther.buyTicketABI)
	    pirateEther.buyTicketABI = ethabi.methodID('buyTicket', [ ]).toString('hex');
	return(pirateEther.buyTicketABI);
    },


    // cb(err, owner)
    getTicketOwner: function (lottery, round, ticket, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
	pirateEther.contractInstances[lotteryIdx].getTicketOwner(round, ticket, cb);
    },


    // cb(err, txid)
    //   function claimPrize(uint8 _sigV, bytes32 _sigR, bytes32 _sigS, uint256 _ticket);
    claimPrize: function(lottery, V, R, S, ticket, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
        console.log('claimPrize(' + lottery + '): V = ' + V + ', R = ' + R + ', S = ' + S);
	pirateEther.contractInstances[lotteryIdx].claimPrize(V, R, S, ticket, cb);
    },

    // cb(err, txid)
    //   function claimAbondonedPrize(uint8 _sigV, bytes32 _sigR, bytes32 _sigS, uint256 _ticket) public {
    claimAbondonedPrize: function(lottery, V, R, S, ticket, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	if (!pirateEther.contractInstances[lotteryIdx])
	    initcontractInstance(lotteryIdx);
        console.log('claimPrize(' + lottery + '): V = ' + V + ', R = ' + R + ', S = ' + S);
	pirateEther.contractInstances[lotteryIdx].claimAbondonedPrize(V, R, S, ticket, cb);
    },


    //
    // cb(err, signature)
    //
    createClaim: function(lottery, address, round, ticket, playerHash, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	const domain = [
	    { name: "name", type: "string" },
	    { name: "version", type: "string" },
	    { name: "chainId", type: "uint256" },
	    { name: "verifyingContract", type: "address" },
	];
	const domainData = {
	    name: "Pirate Lottery",
	    version: "1.0",
	    chainId: pirateEther.chainId,
	    verifyingContract: pirateEther.CONTRACT_ADDRS[lotteryIdx],
	};
	const claim = [
	    { name: "lottery",    type: "string" },
	    { name: "round",      type: "uint256" },
	    { name: "ticket",     type: "uint256" },
	    { name: "playerHash", type: "uint256" },
	];
	pirateEther.getName(lottery, function(err, name) {
	    if (!!err) {
		console.log('createClaim failed to retrieve lottery name: err = ' + err);
		cb(err, null);
		return;
	    }
	    const claimData = {
		lottery: name,
		round: round,
		ticket: common.numberToBN(ticket).toString(10),
		playerHash: playerHash,
	    };
	    const data = JSON.stringify({
		types: {
		    EIP712Domain: domain,
		    Claim: claim,
		},
		domain: domainData,
		primaryType: "Claim",
		message: claimData,
	    });
	    const typedDataParms = {
		method: "eth_signTypedData_v3",
		params: [address, data],
		from: address,
	    };
	    common.web3.currentProvider.sendAsync(typedDataParms, function(err, result) {
		if (!!err) {
		    console.log('createClaim: err = ' + err);
		    cb(err, null);
		    return;
		}
		cb(err, result.result);
	    });
	});
    },


    // cb(err, txid)
    withdraw: function(lottery, cb) {
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	const abiWithdrawFcn = pirateEther.abiEncodeWithdraw();
        const sendData = "0x" + abiWithdrawFcn;
	console.log('withdraw(' + lottery + '): sendData = ' + sendData);
	ether.send(pirateEther.CONTRACT_ADDRS[lotteryIdx], 0, 'wei', sendData, 0, cb);
    },


    abiEncodeWithdraw: function() {
	if (!pirateEther.withdrawABI)
	    pirateEther.withdrawABI = ethabi.methodID('withdraw', [ ]).toString('hex');
	return(pirateEther.withdrawABI);
    },

};


function initcontractInstance(lotteryIdx) {
    console.log('initcontractInstance(' + lotteryIdx + ')');
    const ABIArray = JSON.parse(pirateEther.CONTRACT_ABI);
    const contract = common.web3.eth.contract(ABIArray);
    pirateEther.contractInstances[lotteryIdx] = contract.at(pirateEther.CONTRACT_ADDRS[lotteryIdx]);
}
