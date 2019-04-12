import { Subject } from 'rxjs';
import { shareReplay, startWith, map } from 'rxjs/operators';

const console = {
  log: (...args) =>
    (document.querySelector('pre').textContent += `${args.join(' ')}\n`)
};

const action$ = new Subject();

const dispatchAction = action => action$.next(action);

let count = 0;
setInterval(() => dispatchAction(count++), 1000);

let startCount = 1;

const START = Symbol('START');

const test$ = action$.pipe(
  startWith(START),
  map(i => (i === START ? `start count ${startCount++}` : i)),
  shareReplay({ refCount: true, bufferSize: 1 })
);

const t1 = (message, name, duration) => {
  console.log(message);
  const subscription = test$.subscribe(m => console.log(`${name}: ${m}`));
  setTimeout(() => subscription.unsubscribe(), duration);
};

setTimeout(() => t1('new subscription', 'test 1', 5000), 2000);
setTimeout(() => t1('subscription to hot stream', 'test 2', 5000), 4000);
setTimeout(() => t1('new subscription', 'test 3', 5000), 10000);
setTimeout(() => t1('new subscription', 'test 4', 5000), 20000);
