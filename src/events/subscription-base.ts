// import { Logger, OnApplicationBootstrap } from '@nestjs/common';
// i
// import { EventManager } from '@vb/nest/events/event.manager';
// import { SubscriberInterface } from '@vb/redis/subscribers/subscriber.interface';
// import { forEach } from 'lodash';
//
// export type Subscription = {
//   type: EventType;
//   subscriber: SubscriberInterface;
// };
//
// export abstract class SubscriptionBase implements OnApplicationBootstrap {
//   protected readonly logger = new Logger(this.constructor.name);
//   abstract getSubscriptions(): Subscription[];
//
//   constructor(protected eventManager: EventManager) {}
//
//   onApplicationBootstrap(): void {
//     this.registerSubscriptions();
//     this.logger.log('Subscriptions setup completed.');
//   }
//
//   private registerSubscriptions(): void {
//     const map: Subscription[] = this.getSubscriptions();
//     forEach(map, (subscriber: Subscription) => {
//       const subscriptionHandler: SubscriberInterface = subscriber.subscriber;
//       this.eventManager.subscribe(subscriber.type, subscriptionHandler.handleEvent.bind(subscriptionHandler));
//     });
//   }
// }
