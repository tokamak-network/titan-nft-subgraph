import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  ChangedAddress,
  ChangedPrice,
  ChangedStartTime,
  GiveFree as GiveFreeEvent,
  MultiGiveFree,
  MultiPurchased,
  OwnershipTransferred,
  Purchased,
  Registerd as RegisteredEvent,
} from '../../generated/FirstEvent/FirstEvent';
import {
  Registered,
  PurchasedOrGaveFree,
  ActiveOrNotNFTS,
  NFTInfo,
  EventInfo,
} from '../../generated/schema';

export function handleChangedAddress(event: ChangedAddress): void {
  let eventInfo = EventInfo.load('0');
  if (!eventInfo) {
    eventInfo = new EventInfo('0');
  }
  eventInfo.nftAddress = event.params._nftAddress;
  eventInfo.tokenRecipient = event.params._recipient;
  eventInfo.save();
}
export function handleChangedPrice(event: ChangedPrice): void {
  let eventInfo = EventInfo.load('0');
  if (!eventInfo) {
    eventInfo = new EventInfo('0');
  }
  eventInfo.token = event.params.token;
  eventInfo.price = event.params.amount;
  eventInfo.save();
}
export function handleChangedStartTime(event: ChangedStartTime): void {
  let eventInfo = EventInfo.load('0');
  if (!eventInfo) {
    eventInfo = new EventInfo('0');
  }
  eventInfo.startTime = event.params._startTime;
  eventInfo.save();
}
export function handleGiveFree(event: GiveFreeEvent): void {
  let results = updatePurchasedOrGaveFree(
    [event.params.tokenId],
    event.params.to,
    Address.fromString('0x000000000000000000000000000000000000dEaD'),
    BigInt.fromI32(0),
    Address.fromString('0x000000000000000000000000000000000000dEaD')
  );
  let purchasedOrGaveFree = results[0];
  let activeOrNotNFTS = results[1];
  purchasedOrGaveFree.save();
  activeOrNotNFTS.save();
}
export function handleMultiGiveFree(event: MultiGiveFree): void {
  let results = updatePurchasedOrGaveFree(
    event.params.tokenIds,
    event.params.to,
    Address.fromString('0x000000000000000000000000000000000000dEaD'),
    BigInt.fromI32(0),
    Address.fromString('0x000000000000000000000000000000000000dEaD')
  );
  let purchasedOrGaveFree = results[0];
  let activeOrNotNFTS = results[1];
  purchasedOrGaveFree.save();
  activeOrNotNFTS.save();
}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let eventInfo = EventInfo.load('0');
  if (!eventInfo) {
    eventInfo = new EventInfo('0');
  }
  eventInfo.eventOwner = event.params.newOwner;
  eventInfo.save();
}
export function handleMultiPurchased(event: MultiPurchased): void {
  let results = updatePurchasedOrGaveFree(
    event.params.tokenIds,
    event.params.buyer,
    event.params.token,
    event.params.amount,
    event.params.receipt
  );
  let purchasedOrGaveFree = results[0];
  let activeOrNotNFTS = results[1];
  purchasedOrGaveFree.save();
  activeOrNotNFTS.save();
}
export function handlePurchased(event: Purchased): void {
  let results = updatePurchasedOrGaveFree(
    [event.params.tokenId],
    event.params.buyer,
    event.params.token,
    event.params.amount,
    event.params.receipt
  );
  let purchasedOrGaveFree = results[0];
  let activeOrNotNFTS = results[1];
  purchasedOrGaveFree.save();
  activeOrNotNFTS.save();
}
export function handleRegisterd(event: RegisteredEvent): void {
  let activeOrNotNFTS = ActiveOrNotNFTS.load('0');
  let idOrXs;
  if (!activeOrNotNFTS) {
    activeOrNotNFTS = new ActiveOrNotNFTS('0');
    idOrXs = new Array<string>(101);
  } else {
    idOrXs = activeOrNotNFTS.idOrXs;
  }
  idOrXs![event.params.tokenId.toI32()] = event.params.tokenId.toString();
  activeOrNotNFTS.idOrXs = idOrXs;
  activeOrNotNFTS.save();

  let registered = Registered.load(event.params.tokenId.toString());
  if (!registered) {
    registered = new Registered(event.params.tokenId.toString());
  }
  registered.data = event.params.data;
  registered.operator = event.params.operator;
  registered.from = event.params.from;
  registered.save();
}

function initializePurchasedOrGaveFree(
  purchasedOrGaveFree: PurchasedOrGaveFree,
  tokenId: BigInt
): PurchasedOrGaveFree {
  purchasedOrGaveFree = new PurchasedOrGaveFree(tokenId.toString());
  purchasedOrGaveFree.buyers = [];
  purchasedOrGaveFree.tokenBoughtWiths = [];
  purchasedOrGaveFree.prices = [];
  purchasedOrGaveFree.recipients = [];
  return purchasedOrGaveFree;
}
function updatePurchasedOrGaveFree(
  tokenIds: BigInt[],
  buyer: Address,
  token: Address,
  amount: BigInt,
  receipt: Address
): [PurchasedOrGaveFree, ActiveOrNotNFTS] {
  let purchasedOrGaveFree;
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i];
    purchasedOrGaveFree = PurchasedOrGaveFree.load(tokenId.toString());
    if (!purchasedOrGaveFree) {
      purchasedOrGaveFree = initializePurchasedOrGaveFree(
        purchasedOrGaveFree!,
        tokenId
      );
    }
    let buyers = purchasedOrGaveFree.buyers;
    buyers!.push(buyer);
    purchasedOrGaveFree.buyers = buyers;
    let tokenBoughtWiths = purchasedOrGaveFree.tokenBoughtWiths;
    tokenBoughtWiths!.push(token);
    purchasedOrGaveFree.tokenBoughtWiths = tokenBoughtWiths;
    let prices = purchasedOrGaveFree.prices;
    prices!.push(amount);
    purchasedOrGaveFree.prices = prices;
    let recipients = purchasedOrGaveFree.recipients;
    recipients!.push(receipt);
    purchasedOrGaveFree.recipients = recipients;
  }

  let activeOrNotNFTS = ActiveOrNotNFTS.load('0');
  let idOrXs;
  if (!activeOrNotNFTS) {
    activeOrNotNFTS = new ActiveOrNotNFTS('0');
    idOrXs = new Array<string>(101);
  } else {
    idOrXs = activeOrNotNFTS.idOrXs;
  }
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i];
    idOrXs![tokenId.toI32()] = 'X';
    activeOrNotNFTS.idOrXs = idOrXs;
  }
  return [purchasedOrGaveFree!, activeOrNotNFTS!];
}
