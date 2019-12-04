import { BigInt, log } from "@graphprotocol/graph-ts"
import {
    Transfer
  } from "../../generated/templates/SmartTokenContract/SmartTokenContract"
import {
    Token,
    User,
    UserSmartTokenBalance
  } from "../../generated/schema"

// Smart Token events
// export function handleNewSmartToken(event: NewSmartToken): void {
//     // let smartToken = new SmartToken(event.address.toHex());
//     // let contract = SmartTokenContract.bind(event.address);
//     // smartToken.targetTokenName = contract.name();
//     // smartToken.targetTokenSymbol = contract.symbol();
//     // smartToken.targetTokenDecimals = contract.decimals();
//     // smartToken.save()
// }

// export function handleIssuance(event: Issuance): void {}

// export function handleDestruction(event: Destruction): void {}

export function handleTransfer(event: Transfer): void {
  let smartTokenAddress = event.address;
  let smartTokenEntity = Token.load(smartTokenAddress.toHex());
  if (smartTokenEntity == null) {
    smartTokenEntity = new Token(smartTokenAddress.toHex());
  }
  let amountTransferred = event.params._value;
  let fromAddress = event.params._from;
  let toAddress = event.params._to;
  if(fromAddress != smartTokenAddress) {
    let fromUser = User.load(fromAddress.toHex());
    if (fromUser == null) {
      fromUser = new User(fromAddress.toHex());
    }
    let fromUserSmartTokenBalanceID = fromAddress.toHex() + "-" + smartTokenAddress.toHex();
    let fromUserSmartTokenBalance = UserSmartTokenBalance.load(fromUserSmartTokenBalanceID);
    if (fromUserSmartTokenBalance == null) {
      fromUserSmartTokenBalance = new UserSmartTokenBalance(fromUserSmartTokenBalanceID);
    }
    fromUserSmartTokenBalance.user = fromAddress.toHex();
    fromUserSmartTokenBalance.smartToken = smartTokenAddress.toHex();
    let balance = fromUserSmartTokenBalance.balance || BigInt.fromI32(0);
    fromUserSmartTokenBalance.balance = balance.minus(amountTransferred);
    fromUserSmartTokenBalance.save();
    fromUser.save();
  } 
  if (toAddress != smartTokenAddress) {
    let toUser = User.load(toAddress.toHex());
    if (toUser == null) {
      toUser = new User(toAddress.toHex());
    }
    let toUserSmartTokenBalanceID = toAddress.toHex() + "-" + smartTokenAddress.toHex();
    let toUserSmartTokenBalance = UserSmartTokenBalance.load(toUserSmartTokenBalanceID);
    if (toUserSmartTokenBalance == null) {
      toUserSmartTokenBalance = new UserSmartTokenBalance(toUserSmartTokenBalanceID);
    }
    toUserSmartTokenBalance.user = toAddress.toHex();
    toUserSmartTokenBalance.smartToken = smartTokenAddress.toHex();
    let balance = toUserSmartTokenBalance.balance || BigInt.fromI32(0);
    toUserSmartTokenBalance.balance = balance.plus(amountTransferred);
    toUserSmartTokenBalance.save();
    toUser.save();
  }
}

// export function handleApproval(event: Approval): void {}

// export function handleSmartTokenOwnerUpdate(event: SmartTokenOwnerUpdate): void {
//   let smartTokenEntity = new Token(event.address.toHex());
//   smartTokenEntity.owner = event.params._newOwner.toHex();
//   smartTokenEntity.save();
// }