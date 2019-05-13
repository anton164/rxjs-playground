import { combineLatest, pipe, Observable } from 'rxjs';
import { shareReplay, startWith, map, tap, filter } from 'rxjs/operators';
import { dispatchAction, action$ } from './action$';
import { create } from "rxjs-spy";
import { tag } from "rxjs-spy/operators/tag";
const spy = create({
  // audit: 100
});

spy.log(/action/);
spy.log(/test/);


window.action$ = action$;
window.dispatchAction = dispatchAction;

const evenNumbers$ = action$.pipe(
  filter(i => i % 2 === 0),
  tag('test-even')
);

const evenSubscription = evenNumbers$.subscribe();
setTimeout(() => {
  evenSubscription.unsubscribe();
}, 60000);

const oddNumbers$ = action$.pipe(
  filter(i => i % 2 === 1),
  tag('test-odd')
);

const oddSubscription = oddNumbers$.subscribe();
setTimeout(() => {
  oddSubscription.unsubscribe();
}, 60000);

const divByThree$ = action$.pipe(
  filter(i => i % 3 === 0),
  tag('test-div-three')
);

const divThreeSubscription = divByThree$.subscribe();
setTimeout(() => {
  divThreeSubscription.unsubscribe();
}, 60000);


const console = {
  log: (...args) =>
    (document.querySelector('pre').textContent += `${args.join(' ')}\n`)
};

let count = 0;
setInterval(() => dispatchAction(count++), 1000);

let startCount = 1;

const START = Symbol('START');

const noop = () => null;

const onFirstSubscription = onSubscribe => source => {
  let isFirst = true;
  return source.pipe(
    tap(() => {
      if (isFirst) {
        isFirst = false;
        onSubscribe();
      }
    })
  );
};

const onFirstSubscription3 = onSubscribe => {
  let isFirst = true;
  return pipe(
    tap(() => {
      if (isFirst) {
        isFirst = false;
        onSubscribe();
      }
    })
  );
};

const onFirstSubscription2 = (onSubscribe, onUnSubscribe = noop) => source =>
  Observable.create(observer => {
    onSubscribe();
    const subscription = source.subscribe(observer);
    return () => {
      onUnSubscribe();
      subscription.unsubscribe();
    };
  });

const onFirstSubscription5 = (onSubscribe, onUnSubscribe = noop) => source =>
  Observable.create(observer => {
    onSubscribe();
    const subscription = source.subscribe(observer);
    return {
      unsubscribe: () => {
        onUnSubscribe();
        subscription.unsubscribe();
      }
    };
  });

const onFirstSubscription4 = onSubscribe => source =>
  new Observable(observer => (onSubscribe(), source.subscribe(observer)));

const test1$ = action$.pipe(
  startWith(START),
  map(i => (i === START ? `start stream-1 ${startCount++}` : i)),
  onFirstSubscription(() => console.log('first subscription stream-1')),
  onFirstSubscription3(() => console.log('first subscription v3 stream-1')),
  shareReplay({ refCount: true, bufferSize: 1 }),
  tag("test1")
);

const test2$ = action$.pipe(
  startWith(START),
  map(i => (i === START ? `start stream-2 ${startCount++}` : i)),
  onFirstSubscription(() => console.log('first subscription stream-2')),
  onFirstSubscription2(
    () => console.log('on subscribe stream-2'),
    () => console.log('on unsubscribe stream-2')
  ),
  shareReplay({ refCount: true, bufferSize: 1 })
);

const test3$ = action$.pipe(
  startWith(START),
  map(i => (i === START ? `start stream-3 ${startCount++}` : i)),
  onFirstSubscription(() => console.log('first subscription stream-3')),
  onFirstSubscription4(() => console.log('on subscription v4 stream-3')),
  onFirstSubscription5(
    () => console.log('on subscription v5 stream-3'),
    () => console.log('on unsubscribe v5 stream-2')
  ),
  shareReplay({ refCount: true, bufferSize: 1 })
);

const c$ = combineLatest(test1$, test2$, test3$).pipe(
  map(list => list.join(' - ')),
  shareReplay({ refCount: true, bufferSize: 1 })
);

const t1 = (message, name, duration) => {
  console.log(message);
  const subscription = c$.subscribe(m => console.log(`${name}: ${m}`));
  setTimeout(() => subscription.unsubscribe(), duration);
};

setTimeout(() => t1('\nnew subscription', 'test 1', 5000), 2000);
setTimeout(() => t1('\nsubscription to hot stream', 'test 2', 5000), 4000);
setTimeout(() => t1('\nnew subscription', 'test 3', 5000), 10000);
setTimeout(() => t1('\nnew subscription', 'test 4', 5000), 20000);
