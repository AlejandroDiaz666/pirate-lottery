
const common = require('./common');
const ether = require('./ether');
const pirateEther = require('./pirateEther');
const autoVersion = require('./autoVersion');
const ethUtils = require('ethereumjs-util');
const ethabi = require('ethereumjs-abi');
const Buffer = require('buffer/').Buffer;
const BN = require("bn.js");

document.addEventListener('DOMContentLoaded', function() {
    console.log('content loaded');
    console.log('window.innerWidth = ' + window.innerWidth);
    console.log('window.innerHeight = ' + window.innerHeight);
    index.main();
});


const index = module.exports = {
    openDurationTimers: [],
    closedDurationTimers: [],
    waitingForTxid: false,
    lotteryNames: ['Pirate\'s Booty', 'Buried Treasure' ],
    main: function() {
	console.log('index.main');
	setCommonButtonHandlers();
	setLotteryButtonHandlers('A');
	setLotteryButtonHandlers('B');
	beginTheBeguine();
    },

};


function setCommonButtonHandlers() {
    const youWinModalOKButton = document.getElementById('youWinModalOKButton');
    youWinModalOKButton.addEventListener('click', function() {
	common.replaceElemClassFromTo('youWinModal', 'visibleB', 'hidden', true);
    });
    const howTile = document.getElementById('howTile');
    howTile.addEventListener('click', function() {
	console.log('howTile: got click');
	common.replaceElemClassFromTo('howModal', 'hidden', 'visibleB', true);
    });
    const howClose = document.getElementById('howClose');
    howClose.onclick = function(event) {
	common.replaceElemClassFromTo('howModal', 'visibleB', 'hidden', true);
    };
}


function setLotteryButtonHandlers(lottery) {
    const opnCurPurchaseButton = document.getElementById(lottery + 'opnCurPurchaseButton');
    opnCurPurchaseButton.addEventListener('click', function() {
	common.showWaitingForMetaMask(true);
	pirateEther.buyTicket(lottery, opnCurPurchaseButton.price, function(err, txid) {
	    common.showWaitingForMetaMask(false);
	    console.log('opnCurPurchaseButton.click: txid = ' + txid);
	    waitForTXID(err, txid, 'Buy-Ticket', handleUnlockedMetaMask, ether.etherscanioTxStatusHost, null);
	});
    });
    //
    const claimWithTicketFcn = (lottery, claimFcn, round, ticket, playerHash) => {
	common.showWaitingForMetaMask(true);
	pirateEther.createClaim(lottery, common.web3.eth.accounts[0], round, ticket, playerHash, function(err, signature) {
	    signature = signature.substring(2);
	    const r = '0x' + signature.substring(0, 64);
	    const s = '0x' + signature.substring(64, 128);
	    const v = '0x' + signature.substring(128, 130);
	    console.log('clsPrvClaimWinButton: signature = ' + signature);
	    claimFcn(lottery, v, r, s, ticket, function(err, txid) {
		common.showWaitingForMetaMask(false);
		console.log('clsPrvClaimWinButton.click: txid = ' + txid);
		waitForTXID(err, txid, 'Claim-Prize', handleUnlockedMetaMask, ether.etherscanioTxStatusHost, null);
	    });
	});
    };
    const clsPrvClaimWinButton = document.getElementById(lottery + 'clsPrvClaimWinButton');
    clsPrvClaimWinButton.addEventListener('click', function() {
	pirateEther.getPreviousInfo(lottery, common.web3.eth.accounts[0], function(err, previousInfo) {
	    console.log('clsPrvClaimWinButton: playersHash = ' + previousInfo.playerHash);
	    if (previousInfo.winner == common.web3.eth.accounts[0]) {
		const ticket = common.numberToHex256(previousInfo.winningTicket);
		claimWithTicketFcn(lottery, pirateEther.claimPrize, previousInfo.round, ticket, previousInfo.playerHash);
	    } else {
		console.log('clsPrvClaimWinButton: not the winner...');
		const nowBN = new BN(Date.now() / 1000);
		const claimDeadlineBN = common.numberToBN(previousInfo.claimDeadline);
		if (claimDeadlineBN.gt(nowBN)) {
		    console.log('clsPrvClaimWinButton: not abandoned yet!');
		} else {
		    console.log('clsPrvClaimWinButton: prize is abandoned');
		    pirateEther.getTickets(lottery, common.web3.eth.accounts[0], previousInfo.round, new BN('0'), 1, function(err, lastIdx, tickets) {
			console.log('clsPrvClaimWinButton: we have a ticket');
			if (tickets.length > 0) {
			    const ticket = tickets[0];
			    claimWithTicketFcn(lottery, pirateEther.claimAbondonedPrize, previousInfo.round, ticket, previousInfo.playerHash);
			}
		    });
		}
	    }
	});
    });
    const withdrawButton = document.getElementById('withdraw' + lottery + 'Button');
    withdrawButton.addEventListener('click', function() {
	common.showWaitingForMetaMask(true);
	pirateEther.withdraw(lottery, function(err, txid) {
	    common.showWaitingForMetaMask(false);
	    console.log('txid = ' + txid);
	    waitForTXID(err, txid, 'Withdraw', handleUnlockedMetaMask, ether.etherscanioTxStatusHost, null);
	});
    });
}



function setOptionsButtonHandlers() {
    const versionArea = document.getElementById('versionArea');
    versionArea.textContent = 'Build: ' + autoVersion.version();
    const optionsButton = document.getElementById('optionsButton');
    optionsButton.addEventListener('click', () => { common.replaceElemClassFromTo('optionsPanel', 'hidden', 'visibleB', null); });
    const closeOptionsButton = document.getElementById('closeOptionsButton');
    closeOptionsButton.addEventListener('click', () => {
	common.replaceElemClassFromTo('optionsPanel', 'visibleB', 'hidden', null);
	if (localStorage['logsNode'] != ether.node) {
	    //if node changed...
	    ether.node = localStorage['logsNode'];
	    if (!!index.acctInfo && !!index.listMode)
		makeMsgList(getCurMsgNo(index.acctInfo), () => { showMsgLoop(index.acctInfo); });
	}
    });
    const marysThemeButton = document.getElementById('marysThemeButton');
    const wandasThemeButton = document.getElementById('wandasThemeButton');
    const relaxThemeButton = document.getElementById('relaxThemeButton');
    const themedStyle = document.getElementById('themedStyle');
    const updateThemeFcn = (theme) => {
	localStorage['theme'] = theme;
	if (themedStyle.href.indexOf('marys-style') >= 0)
	    themedStyle.href = themedStyle.href.replace('marys-style', localStorage['theme']);
	if (themedStyle.href.indexOf('wandas-style') >= 0)
	    themedStyle.href = themedStyle.href.replace('wandas-style', localStorage['theme']);
	if (themedStyle.href.indexOf('relax-style') >= 0)
	    themedStyle.href = themedStyle.href.replace('relax-style', localStorage['theme']);
    };
    if (!!localStorage['theme'] && localStorage['theme'].indexOf('wanda') >= 0) {
	wandasThemeButton.checked = true;
	updateThemeFcn('wandas-style');
    } else if (!!localStorage['theme'] && localStorage['theme'].indexOf('mary') >= 0) {
	marysThemeButton.checked = true;
	updateThemeFcn('marys-style');
    } else {
	relaxThemeButton.checked = true;
	updateThemeFcn('relax-style');
    }
    marysThemeButton.addEventListener('click', () => {	updateThemeFcn('marys-style'); });
    wandasThemeButton.addEventListener('click', () => { updateThemeFcn('wandas-style'); });
    relaxThemeButton.addEventListener('click', () => { updateThemeFcn('relax-style'); });
    //
    const startFirstUnreadButton = document.getElementById('startFirstUnreadButton');
    const startLastViewedButton = document.getElementById('startLastViewedButton');
    if (!localStorage['onStartGoto'])
	localStorage['onStartGoto'] = 'first-unread';
    if (localStorage['onStartGoto'].indexOf('last-viewed') >= 0)
	startLastViewedButton.checked = true;
    else
	startFirstUnreadButton.checked = true;
    const updateStartGotoFcn = (goto) => { localStorage['onStartGoto'] = goto; };
    startFirstUnreadButton.addEventListener('click', () => { updateStartGotoFcn('first-unread'); });
    startLastViewedButton.addEventListener('click', () => { updateStartGotoFcn('last-viewed'); });
}


//
//
async function beginTheBeguine() {
    console.log('beginTheBeguine');
    //await doFirstIntro(false);
    common.checkForMetaMask(true, function(err, w3) {
	const acct = (!err && !!w3) ? w3.eth.accounts[0] : null;
	console.log('beginTheBeguine: checkForMetaMask acct = ' + acct);
	index.account = acct;
	if (!!err) {
	    console.log('beginTheBeguine: checkForMetaMask err = ' + err);
	    handleLockedMetaMask(err);
	} else {
	    handleUnlockedMetaMask();
	}
    });
}


//
// handle locked metamask
//
function handleLockedMetaMask(err) {
    console.log('handleLockedMetaMask');
    const networkArea = document.getElementById('networkArea');
    networkArea.value = '';
    const accountArea = document.getElementById('accountArea');
    accountArea.value = '';
    const balanceArea = document.getElementById('balanceArea');
    balanceArea.value = '';
    const lotteryABalanceArea = document.getElementById('lotteryABalanceArea');
    lotteryABalanceArea.value = '';
    const lotteryBBalanceArea = document.getElementById('lotteryBBalanceArea');
    lotteryBBalanceArea.value = '';
    clearStatusDiv();
    alert(err);
}


//
// handle unlocked metamask
// displays the users's eth account info; then continues on to handleOpenRound orhandleClosedRound for each lottery
//
// note: after a transaction is completed we come back to this fcn
//
function handleUnlockedMetaMask() {
    console.log('handleUnlockedMetaMask');
    index.localStoragePrefix = (common.web3.eth.accounts[0]).substring(2, 10) + '-';
    const accountArea = document.getElementById('accountArea');
    accountArea.value = 'Your account: ' + common.web3.eth.accounts[0];
    ether.getBalance('szabo', function(err, balance) {
	const balanceArea = document.getElementById('balanceArea');
	const balanceSzabo = parseInt(balance);
	console.log('balanceSzabo = ' + balanceSzabo);
	const balanceETH = (balanceSzabo / ether.SZABO_PER_ETH).toFixed(6);
	balanceArea.value = 'Balance: ' + balanceETH.toString(10) + ' Eth';
    });
    ether.getNetwork(function(err, network) {
	const networkArea = document.getElementById('networkArea');
	if (!!err) {
	    networkArea.value = 'Error: ' + err;
	} else {
	    networkArea.value = 'Network: ' + network;
	    pirateEther.setNetwork(network);
	    if (network.startsWith('Mainnet'))
		networkArea.className = (networkArea.className).replace('attention', '');
	    else if (networkArea.className.indexOf(' attention' < 0))
		networkArea.className += ' attention';
	}
	pirateEther.getBalance('A', common.web3.eth.accounts[0], function(err, balanceBN) {
	    const lotteryABalanceArea = document.getElementById('lotteryABalanceArea');
	    const withdrawAButton = document.getElementById('withdrawAButton');
	    const name = index.lotteryNames[0];
	    lotteryABalanceArea.value = 'Winnings from ' + name + ': ' + ether.convertWeiBNToComfort(balanceBN);
	    withdrawAButton.disabled = balanceBN.isZero() ? true : false;
	});
	pirateEther.getBalance('B', common.web3.eth.accounts[0], function(err, balanceBN) {
	    const lotteryABalanceArea = document.getElementById('lotteryBBalanceArea');
	    const withdrawBButton = document.getElementById('withdrawBButton');
	    const name = index.lotteryNames[1];
	    lotteryABalanceArea.value = 'Winnings from ' + name + ': ' + ether.convertWeiBNToComfort(balanceBN);
	    withdrawBButton.disabled = balanceBN.isZero() ? true : false;
	});
	pirateEther.getCurrentInfo('A', common.web3.eth.accounts[0], function(err, currentInfo) {
	    console.log('handleUnlockedMetaMask: getCurrentInfo err = ' + err);
	    pirateEther.getPreviousInfo('A', common.web3.eth.accounts[0], function(err, previousInfo) {
		console.log('handleUnlockedMetaMask: getPreviousInfo err = ' + err);
		const handleFcn = (currentInfo.isOpen) ? handleOpenRound : handleClosedRound;
		handleFcn('A', currentInfo, previousInfo);
	    });
	});
	//
	pirateEther.getCurrentInfo('B', common.web3.eth.accounts[0], function(err, currentInfo) {
	    console.log('handleUnlockedMetaMask: getCurrentInfo err = ' + err);
	    pirateEther.getPreviousInfo('B', common.web3.eth.accounts[0], function(err, previousInfo) {
		console.log('handleUnlockedMetaMask: getPreviousInfo err = ' + err);
		const handleFcn = (currentInfo.isOpen) ? handleOpenRound : handleClosedRound;
		handleFcn('B', currentInfo, previousInfo);
	    });
	});
    });
    common.clearStatusDiv();
}


//
// lottery = 'A' | 'B'
//
function handleOpenRound(lottery, currentInfo, previousInfo) {
    console.log('handleOpenRound');
    const lotteryIdx = lottery == 'A' ? 0 : 1;
    if (!!index.openDurationTimers[lotteryIdx]) {
	clearInterval(index.openDurationTimers[lotteryIdx]);
	index.openDurationTimers[lotteryIdx] = null;
    }
    const opnCurLotteryRoundNo = document.getElementById(lottery + 'opnCurLotteryRoundNo');
    const opnCurTicketPrice = document.getElementById(lottery + 'opnCurTicketPrice');
    const opnCurMaxTickets = document.getElementById(lottery + 'opnCurMaxTickets');
    const opnCurMaxPrize = document.getElementById(lottery + 'opnCurMaxPrize');
    const opnCurMaxDuration = document.getElementById(lottery + 'opnCurMaxDuration');
    const opnCurTicketsRemain = document.getElementById(lottery + 'opnCurTicketsRemain');
    const opnCurTicketsSoFar = document.getElementById(lottery + 'opnCurTicketsSoFar');
    const opnCurPrizeSoFar = document.getElementById(lottery + 'opnCurPrizeSoFar');
    //
    opnCurLotteryRoundNo.textContent = currentInfo.round;
    const endDate = parseInt(currentInfo.endDate);
    const begDate = parseInt(currentInfo.begDate);
    let durationRem = parseInt(endDate);
    if (begDate != 0) {
	if ((durationRem = parseInt(endDate - Date.now() / 1000)) < 0)
	    durationRem = 0;
    }
    const showDurationFcn = (durationRem) => {
	durationRem = Math.max(0, durationRem);
	const durationDays = parseInt(durationRem / (60 * 60 * 24));
	durationRem %= (60 * 60 * 24);
	const durationHrs = parseInt(durationRem / (60 * 60));
	durationRem %= (60 * 60);
	const durationMins = parseInt(durationRem / 60);
	const durationSecs = durationRem % 60;
	opnCurMaxDuration.textContent = durationDays.toString(10) + ':' +
	                              common.leftPadTo(durationHrs.toString(10), 2, '0') + ':' +
	                              common.leftPadTo(durationMins.toString(10), 2, '0') + ':' +
	                              common.leftPadTo(durationSecs.toString(10), 2, '0');
    };
    if (begDate == 0 || durationRem == 0) {
	showDurationFcn(durationRem);
    } else {
	index.openDurationTimer = setInterval(function() {
	    showDurationFcn(durationRem);
	    --durationRem;
	}, 1000);
    }
    const ticketsRemain = (begDate != 0 && durationRem <= 0) ? 1 : currentInfo.maxTickets - currentInfo.ticketCount;
    opnCurTicketsRemain.textContent = ticketsRemain;
    const ticketPriceBN = common.numberToBN(currentInfo.ticketPrice);
    const maxTicketsBN = common.numberToBN(currentInfo.maxTickets);
    const curPrizeBN = common.numberToBN(currentInfo.prize);
    const maxPrizeBN = ticketPriceBN.mul(maxTicketsBN);
    const maxPrizeStr = ether.convertWeiBNToComfort(maxPrizeBN);
    const curPrizeStr = ether.convertWeiBNToComfort(curPrizeBN);
    opnCurMaxPrize.textContent = common.leftPadTo(maxPrizeStr, 12, '\u00a0');
    opnCurPrizeSoFar.textContent = common.leftPadTo(curPrizeStr, 12, '\u00a0');
    opnCurTicketsSoFar.textContent = common.leftPadTo(currentInfo.ticketCount, 6, '\u00a0') + ' tickets';
    opnCurMaxTickets.textContent = common.leftPadTo(currentInfo.maxTickets, 6, '\u00a0') + ' tickets';
    //
    console.log('handleOpenRound: ticket price = ' + currentInfo.ticketPrice);
    opnCurTicketPrice.textContent = ether.convertWeiBNToComfort(ticketPriceBN);
    const opnCurPurchaseButton = document.getElementById(lottery + 'opnCurPurchaseButton');
    opnCurPurchaseButton.price = currentInfo.ticketPrice;
    common.replaceElemClassFromTo(lottery + 'opnCurPurchaseButton',   'hidden',   'visibleB', false);
    //
    const playerTicketCount = parseInt(currentInfo.playerTicketCount);
    console.log('playerTicketCount = ' + playerTicketCount);
    pirateEther.getTickets(lottery, common.web3.eth.accounts[0], currentInfo.round, new BN('0'), playerTicketCount, function(err, lastIdx, tickets) {
	makeTicketListElems(lottery + 'opnCurYourTicketsList', playerTicketCount, tickets);
    });
    //
    //previous round
    //
    const opnPrvRoundNo = document.getElementById(lottery + 'opnPrvRoundNo');
    const opnPrvWinningTicketNo = document.getElementById(lottery + 'opnPrvWinningTicketNo');
    const opnPrvClaimMsgPrvNo = document.getElementById(lottery + 'opnPrvClaimMsgPrvNo');
    const opnPrvClaimMsgCurNo = document.getElementById(lottery + 'opnPrvClaimMsgCurNo');
    opnPrvRoundNo.textContent = previousInfo.round;
    opnPrvWinningTicketNo.textContent = '#' + common.leftPadTo(previousInfo.winningTicket, 7, '0');
    const prevPrizeBN = common.numberToBN(previousInfo.prize);
    const prevPrizeStr = ether.convertWeiBNToComfort(prevPrizeBN);
    const opnPrvPrize = document.getElementById(lottery + 'opnPrvPrize');
    const opnPrvTickets = document.getElementById(lottery + 'opnPrvTickets');
    opnPrvPrize.textContent = common.leftPadTo(prevPrizeStr, 12, '\u00a0');
    opnPrvTickets.textContent = common.leftPadTo(previousInfo.ticketCount, 6, '\u00a0') + ' tickets';
    opnPrvClaimMsgCurNo.textContent = currentInfo.round;
    opnPrvClaimMsgPrvNo.textContent = previousInfo.round;
    const playerPrevTicketCount = parseInt(previousInfo.playerTicketCount);
    console.log('playerPrevTicketCount = ' + playerPrevTicketCount);
    pirateEther.getTickets(lottery, common.web3.eth.accounts[0], previousInfo.round, new BN('0'), playerPrevTicketCount, function(err, lastIdx, tickets) {
	makeTicketListElems(lottery + 'opnPrvYourTicketsList', playerPrevTicketCount, tickets);
    });
    //
    common.replaceElemClassFromTo(lottery + 'opnRoundInfo',      'hidden',   'visibleB',  true);
    common.replaceElemClassFromTo(lottery + 'opnCurYourTickets', 'hidden',   'visibleB',  true);
    common.replaceElemClassFromTo(lottery + 'opnPrvYourTickets', 'hidden',   'visibleB',  true);
    common.replaceElemClassFromTo(lottery + 'clsRoundInfo',      'visibleB', 'hidden',    true);
    common.replaceElemClassFromTo(lottery + 'clsCurYourTickets', 'visibleB', 'hidden',    true);
    common.replaceElemClassFromTo(lottery + 'clsPrvYourTickets', 'visibleB', 'hidden',    true);
    clearStatusDiv();
}



//
// lottery = 'A' | 'B'
//
function handleClosedRound(lottery, currentInfo, previousInfo) {
    console.log('handleClosedRound');
    const lotteryIdx = lottery == 'A' ? 0 : 1;
    const clsCurLotteryRoundNo = document.getElementById(lottery + 'clsCurLotteryRoundNo');
    const clsCurTicketPrice = document.getElementById(lottery + 'clsCurTicketPrice');
    const clsCurPrize = document.getElementById(lottery + 'clsCurPrize');
    const clsCurTickets = document.getElementById(lottery + 'clsCurTickets');
    const clsCurWinningTicket = document.getElementById(lottery + 'clsCurWinningTicket');
    clsCurLotteryRoundNo.textContent = currentInfo.round;
    //current round
    const curPrizeBN = common.numberToBN(currentInfo.prize);
    const finalPrizeStr = ether.convertWeiBNToComfort(curPrizeBN);
    clsCurPrize.textContent = common.leftPadTo(finalPrizeStr, 12, '\u00a0');
    clsCurTickets.textContent = common.leftPadTo(currentInfo.ticketCount, 6, '\u00a0') + ' tickets';
    const playerTicketCount = parseInt(currentInfo.playerTicketCount);
    console.log('playerTicketCount = ' + playerTicketCount);
    pirateEther.getTickets(lottery, common.web3.eth.accounts[0], currentInfo.round, new BN('0'), playerTicketCount, function(err, lastIdx, tickets) {
	makeTicketListElems(lottery + 'clsCurYourTicketsList', playerTicketCount, tickets);
    });
    //
    //previous round
    //
    if (!!index.closedDurationTimers[lotteryIdx]) {
	clearInterval(index.closedDurationTimers[lotteryIdx]);
	index.closedDurationTimers[lotteryIdx] = null;
    }
    const clsPrvRoundNo = document.getElementById(lottery + 'clsPrvRoundNo');
    const clsPrvWinningTicketNo = document.getElementById(lottery + 'clsPrvWinningTicketNo');
    const clsPrvPrize = document.getElementById(lottery + 'clsPrvPrize');
    const clsPrvTickets = document.getElementById(lottery + 'clsPrvTickets');
    const clsPrvClaimDeadline = document.getElementById(lottery + 'clsPrvClaimDeadline');
    clsPrvRoundNo.textContent = previousInfo.round;
    clsPrvWinningTicketNo.textContent = '#' + common.leftPadTo(previousInfo.winningTicket, 7, '0');
    const nowBN = new BN(Date.now() / 1000);
    const claimDeadlineBN = common.numberToBN(previousInfo.claimDeadline);
    let durationRem = 0;
    if (claimDeadlineBN.gt(nowBN))
	durationRem = claimDeadlineBN.isub(nowBN).toNumber();
    const showDurationFcn = (durationRem) => {
	const durationDays = parseInt(durationRem / (60 * 60 * 24));
	durationRem %= (60 * 60 * 24);
	const durationHrs = parseInt(durationRem / (60 * 60));
	durationRem %= (60 * 60);
	const durationMins = parseInt(durationRem / 60);
	const durationSecs = durationRem % 60;
	clsPrvClaimDeadline.textContent = durationDays.toString(10) + ':' +
	                                  common.leftPadTo(durationHrs.toString(10), 2, '0') + ':' +
	                                  common.leftPadTo(durationMins.toString(10), 2, '0') + ':' +
	                                  common.leftPadTo(durationSecs.toString(10), 2, '0');
    };
    if (durationRem == 0) {
	common.replaceElemClassFromTo(lottery + 'clsPrvDeadlineNotExpired', 'visibleB', 'hidden', true);
	common.replaceElemClassFromTo(lottery + 'clsPrvDeadlineYesExpired', 'hidden', 'visibleB', true);
	showDurationFcn(durationRem);
    } else {
	common.replaceElemClassFromTo(lottery + 'clsPrvDeadlineNotExpired', 'hidden', 'visibleB', true);
	common.replaceElemClassFromTo(lottery + 'clsPrvDeadlineYesExpired', 'visibleB', 'hidden', true);
	index.closedDurationTimers[lotteryIdx] = setInterval(function() {
	    showDurationFcn(durationRem);
	    --durationRem;
	}, 1000);
    }
    const prevPrizeBN = common.numberToBN(previousInfo.prize);
    const prevPrizeStr = ether.convertWeiBNToComfort(prevPrizeBN);
    clsPrvPrize.textContent = common.leftPadTo(prevPrizeStr, 12, '\u00a0');
    clsPrvTickets.textContent = common.leftPadTo(previousInfo.ticketCount, 6, '\u00a0') + ' tickets';
    //clsWinningTicket.textContent = previousInfo.winningTicket;
    const playerPrevTicketCount = parseInt(previousInfo.playerTicketCount);
    console.log('playerPrevTicketCount = ' + playerPrevTicketCount);
    pirateEther.getTickets(lottery, common.web3.eth.accounts[0], previousInfo.round, new BN('0'), playerPrevTicketCount, function(err, lastIdx, tickets) {
	makeTicketListElems(lottery + 'clsPrvYourTicketsList', playerPrevTicketCount, tickets);
    });
    //
    if (previousInfo.winner == common.web3.eth.accounts[0]) {
	console.log('previousInfo.message = ' + previousInfo.message);
	const lotteryIdx = lottery == 'A' ? 0 : 1;
	const name = index.lotteryNames[lotteryIdx];
	const youWinMsgTop = document.getElementById('youWinMsgTop');
	const youWinMsgBot = document.getElementById('youWinMsgBot');
	youWinMsgTop.textContent = 'You won the ' + name + ' lottery, round ' + previousInfo.round + '!!';
	youWinMsgBot.textContent = 'Make sure to claim your prize before the expiration of the claim timer!';
	common.replaceElemClassFromTo(lottery + 'clsPrvClaimWinButton', 'hidden', 'visibleB', false);
	common.replaceElemClassFromTo('youWinModal',          'hidden', 'visibleB', true);
    } else if (durationRem == 0 && playerPrevTicketCount > 0) {
	common.replaceElemClassFromTo(lottery + 'clsPrvClaimWinButton', 'hidden', 'visibleB', false);
    } else {
	common.replaceElemClassFromTo(lottery + 'clsPrvClaimWinButton', 'visibleB', 'hidden', true);
    }
    common.replaceElemClassFromTo(lottery + 'opnRoundInfo',      'visibleB', 'hidden',    true);
    common.replaceElemClassFromTo(lottery + 'opnCurYourTickets', 'visibleB', 'hidden',    true);
    common.replaceElemClassFromTo(lottery + 'opnPrvYourTickets', 'visibleB', 'hidden',    true);
    common.replaceElemClassFromTo(lottery + 'clsCurYourTickets', 'hidden',   'visibleB',  true);
    common.replaceElemClassFromTo(lottery + 'clsPrvYourTickets', 'hidden',   'visibleB',  true);
    common.replaceElemClassFromTo(lottery + 'clsRoundInfo',      'hidden',   'visibleB',  true);
    clearStatusDiv();
}


function makeTicketListElems(tableId, playerTicketCount, tickets) {
    console.log('makeMsgListElems: tableId = ' + tableId + ', playerTicketCount = ' + playerTicketCount + ', tickets = ' + tickets);
    const table = document.getElementById(tableId);
    while (table.hasChildNodes()) {
	table.removeChild(table.lastChild);
    }
    if (playerTicketCount > tickets.length) {
	//should never happen. but playerTicketCount can be lt. tickets.length (getTickets fills with zeros)
	console.log('makeMsgListElems: hey! playerTicketCount = ' + playerTicketCount + ', but tickets.length = ' + tickets.length);
	playerTicketCount = tickets.length;
    }
    for (let i = 0; i < playerTicketCount; ++i) {
        const div0 = document.createElement("div");
        const div1 = document.createElement("div");
        const area = document.createElement("textarea");
	div0.className = 'yourTicketsListDiv0';
	div1.className = 'yourTicketsListDiv1';
	area.className = 'yourTicketsListArea';
        area.rows = 1;
        area.readonly = 'readonly';
        area.disabled = 'disabled';
        area.value = '#' + common.leftPadTo(tickets[i], 7, '0');
        div0.appendChild(div1);
        div1.appendChild(area);
        table.appendChild(div0);
    }
}
