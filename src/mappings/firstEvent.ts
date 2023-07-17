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
  updatePurchasedOrGaveFree(
    [event.params.tokenId],
    event.params.to,
    Address.fromString('0x000000000000000000000000000000000000dEaD'),
    BigInt.fromI32(0),
    Address.fromString('0x000000000000000000000000000000000000dEaD')
  );
}
export function handleMultiGiveFree(event: MultiGiveFree): void {
  updatePurchasedOrGaveFree(
    event.params.tokenIds,
    event.params.to,
    Address.fromString('0x000000000000000000000000000000000000dEaD'),
    BigInt.fromI32(0),
    Address.fromString('0x000000000000000000000000000000000000dEaD')
  );
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
  updatePurchasedOrGaveFree(
    event.params.tokenIds,
    event.params.buyer,
    event.params.token,
    event.params.amount,
    event.params.receipt
  );
}
export function handlePurchased(event: Purchased): void {
  updatePurchasedOrGaveFree(
    [event.params.tokenId],
    event.params.buyer,
    event.params.token,
    event.params.amount,
    event.params.receipt
  );
}
export function handleRegisterd(event: RegisteredEvent): void {
  let activeOrNotNFTS = ActiveOrNotNFTS.load('0');
  let idOrXs: Array<string>;
  if (!activeOrNotNFTS) {
    activeOrNotNFTS = new ActiveOrNotNFTS('0');
    idOrXs = new Array<string>(101).fill('0');
  } else {
    idOrXs = activeOrNotNFTS.idOrXs!;
  }
  idOrXs[event.params.tokenId.toI32()] = event.params.tokenId.toString();
  activeOrNotNFTS.idOrXs = idOrXs;
  activeOrNotNFTS.save();

  let registered = Registered.load(event.params.tokenId.toString());
  if (!registered) {
    registered = new Registered(event.params.tokenId.toString());
  }
  registered.owner = Address.fromString(
    '0x000000000000000000000000000000000000dEaD'
  );
  registered.tokenID = event.params.tokenId;
  registered.data = event.params.data;
  registered.operator = event.params.operator;
  registered.from = event.params.from;
  registered.save();
}

function initializePurchasedOrGaveFree(
  purchasedOrGaveFree: PurchasedOrGaveFree | null,
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
): void {
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i];
    let purchasedOrGaveFree = PurchasedOrGaveFree.load(tokenId.toString());
    if (!purchasedOrGaveFree) {
      purchasedOrGaveFree = initializePurchasedOrGaveFree(
        purchasedOrGaveFree,
        tokenId
      );
    }
    purchasedOrGaveFree.tokenID = tokenId;
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
    purchasedOrGaveFree.save();
  }
  let activeOrNotNFTS: ActiveOrNotNFTS | null = ActiveOrNotNFTS.load('0');
  let idOrXs: string[] | null;
  if (!activeOrNotNFTS) {
    activeOrNotNFTS = new ActiveOrNotNFTS('0');
    idOrXs = new Array<string>(101).fill('0');
  } else {
    idOrXs = activeOrNotNFTS.idOrXs;
  }
  for (let i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i];
    idOrXs![tokenId.toI32()] = 'X';
    activeOrNotNFTS.idOrXs = idOrXs;
  }
  activeOrNotNFTS.save();

  for (let i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i];
    let registered = Registered.load(tokenId.toString());
    registered!.owner = buyer;
    registered!.save();
  }
}
