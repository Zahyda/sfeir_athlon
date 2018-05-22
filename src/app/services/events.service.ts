import {Injectable} from '@angular/core';
import {Event} from '../models/event';
import {Observable} from 'rxjs/Observable';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {RankedTeamleader} from '../models/ranked-teamleader';
import {EventRank} from '../models/event-rank';
import * as _ from 'lodash';
import {TeamLeader} from '../models/team-leader';

@Injectable()
export class EventsService {

  private _events: AngularFirestoreCollection<Event>;

  constructor(private _fbDataBase: AngularFirestore) {
    this._events = this._fbDataBase.collection('events');
  }

  get events(): Observable<Array<Event>> {
    return this._events.valueChanges()
      .map(events =>
        events.reverse());
  }

  get groupedTeamleaders(): Observable<Array<RankedTeamleader>> {
    return this._events.valueChanges()
      .map(events => {
        const classement = events.map(e => e.classement).reduce((result: Array<EventRank>, c) => result.concat(c), []);
        const gr = _.groupBy(classement, 'tl.id');
        const gtl: Array<RankedTeamleader> = [];

        for (const key in gr) {
          const er = gr[key];
          const rtl: RankedTeamleader = <RankedTeamleader>{
            teamleader : er[0].tl,
            points: er.reduce((p, c) => p + c.points, 0),
            places: er.reduce((p, c) => p + c.rank, 0),
          };
          gtl.push(rtl);
        }

        return gtl.sort((a: RankedTeamleader, b: RankedTeamleader) => {
          return (b.points - b.places) - (a.points - a.places);
        })
          .map((t, i) => {
            t.classement = i + 1;
            return t;
          });
      });
  }
}
