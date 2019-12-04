import {
    BigInt,
    log
} from "@graphprotocol/graph-ts"
import {
    ConverterAddition
} from "../../generated/ConverterRegistryContract1/ConverterRegistryContract"
import {
    ConverterContract
} from "../../generated/ConverterRegistryContract1/ConverterContract"
import {
    SmartTokenContract
} from "../../generated/ConverterRegistryContract1/SmartTokenContract"
import {
    ERC20Contract
} from "../../generated/ConverterRegistryContract1/ERC20Contract"
import {
    SmartTokenContract as SmartTokenTemplate,
    ConverterContract as ConverterTemplate
} from "../../generated/templates"
import {
    Converter,
    Token
} from "../../generated/schema"

// Converter Registry events
export function handleConverterAddition(event: ConverterAddition): void {
    log.debug("Converter added to registry: {}, Token: {}", [event.params._address.toHex(), event.params._token.toHex()]);
    let converterAddress = event.params._address;
    let converterEntity = Converter.load(converterAddress.toHex());

    if (converterEntity == null) {
        ConverterTemplate.create(event.params._address);
        converterEntity = new Converter(converterAddress.toHex());
    }
    let converterContract = ConverterContract.bind(converterAddress);

    let smartTokenAddress = converterContract.token();
    SmartTokenTemplate.create(smartTokenAddress);

    let smartTokenContract = SmartTokenContract.bind(smartTokenAddress);
    let smartTokenEntity = new Token(smartTokenAddress.toHex());
    smartTokenEntity.isSmartToken = true;

    let connectorTokenAddress = event.params._token;

    let connectorTokenEntity = Token.load(connectorTokenAddress.toHex());
    if (connectorTokenEntity == null) {
        connectorTokenEntity = new Token(connectorTokenAddress.toHex());
    }
    let connectorTokenContract = ERC20Contract.bind(connectorTokenAddress);
    connectorTokenEntity.isSmartToken = false;

    let connectorTokenNameResult = connectorTokenContract.try_name();
    if (!connectorTokenNameResult.reverted) {
        connectorTokenEntity.name = connectorTokenNameResult.value;
    }
    let connectorTokenSymbolResult = connectorTokenContract.try_symbol();
    if (!connectorTokenSymbolResult.reverted) {
        connectorTokenEntity.symbol = connectorTokenSymbolResult.value;
    }
    let connectorTokenDecimalsResult = connectorTokenContract.try_decimals();
    if (!connectorTokenDecimalsResult.reverted) {
        connectorTokenEntity.decimals = connectorTokenDecimalsResult.value;
    }

    let connectorTokenConverters = connectorTokenEntity.converters || [];
    connectorTokenConverters.push(converterAddress.toHex());
    log.debug("Connector Token Converters: {}", [connectorTokenConverters.toString()])
    connectorTokenEntity.converters = connectorTokenConverters;
    connectorTokenEntity.save();

    let smartTokenNameResult = smartTokenContract.try_name();
    if (!smartTokenNameResult.reverted) {
        smartTokenEntity.name = smartTokenNameResult.value;
    }
    let smartTokenSymbolResult = smartTokenContract.try_symbol();
    if (!smartTokenSymbolResult.reverted) {
        smartTokenEntity.symbol = smartTokenSymbolResult.value;
    }
    let smartTokenDecimalsResult = smartTokenContract.try_decimals();
    if (!smartTokenDecimalsResult.reverted) {
        smartTokenEntity.decimals = smartTokenDecimalsResult.value;
    }
    let smartTokenTotalSupplyResult = smartTokenContract.try_totalSupply();
    if (!smartTokenTotalSupplyResult.reverted) {
        smartTokenEntity.totalSupply = smartTokenTotalSupplyResult.value;
    }
    let smartTokenConverters = smartTokenEntity.converters || [];
    smartTokenConverters.push(converterAddress.toHex());
    log.debug("Smart Token Converters: {}", [smartTokenConverters.toString()])
    smartTokenEntity.converters = smartTokenConverters;
    converterEntity.smartToken = smartTokenAddress.toHex();
    smartTokenEntity.save();
    converterEntity.save();
}