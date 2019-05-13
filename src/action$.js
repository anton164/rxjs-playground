import { Subject } from 'rxjs';
import { tag } from "rxjs-spy/operators/tag";
import { share } from 'rxjs/operators';

export const action$ = new Subject().pipe(
  tag("action$"),
  share()
);
export const dispatchAction = action => {
  console.log('action$.next()');
  action$.next(action)
};