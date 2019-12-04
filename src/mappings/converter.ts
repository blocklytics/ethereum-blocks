import { BigInt, log } from "@graphprotocol/graph-ts"
import {
    ConverterContract,
    PriceDataUpdate  
} from "../../generated/templates/ConverterContract/ConverterContract"
  import {
    ConverterTokenBalance
  } from "../../generated/schema"

// Converter events
  export function handlePriceDataUpdate(event: PriceDataUpdate): void {
    log.debug("PriceDataUpdate emitted for converter: {}, Token Supply: {}, Connector Balance: {}, Connector Weight {}", [event.address.toHex(), event.params._tokenSupply.toString(), event.params._connectorBalance.toString(), event.params._connectorWeight.toString()])
    let converterAddress = event.address;
    let converterContract = ConverterContract.bind(converterAddress);
    let converterToken = converterContract.token();
    let tokenAddress = event.params._connectorToken;

    let converterTokenBalanceID = converterAddress.toHex() + "-" + tokenAddress.toHex();
    let converterTokenBalance = ConverterTokenBalance.load(converterTokenBalanceID);
    if(converterTokenBalance === null) {
      converterTokenBalance = new ConverterTokenBalance(converterTokenBalanceID);
    }
    converterTokenBalance.converter = converterAddress.toHex();
    converterTokenBalance.token = tokenAddress.toHex();
    converterTokenBalance.balance = event.params._connectorBalance;

    let converterSmartTokenBalanceID = converterAddress.toHex() + "-" + converterToken.toHex();
    let converterSmartTokenBalance = ConverterTokenBalance.load(converterSmartTokenBalanceID);
    if(converterSmartTokenBalance === null) {
      converterSmartTokenBalance = new ConverterTokenBalance(converterSmartTokenBalanceID);
    }
    converterSmartTokenBalance.converter = converterAddress.toHex();
    converterSmartTokenBalance.token = converterToken.toHex();
    converterSmartTokenBalance.balance = event.params._tokenSupply;
    converterTokenBalance.save();
    converterSmartTokenBalance.save();
  }