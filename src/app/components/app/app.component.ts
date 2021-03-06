import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  constructor(private _fbDataBase: AngularFirestore, private swUpdate: SwUpdate) {
    this._fbDataBase.firestore.enablePersistence().then();
  }

  ngOnInit() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      console.log('beforeinstallprompt');
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      deferredPrompt.prompt();
    });

    if (this.swUpdate.isEnabled) {

      this.swUpdate.available.subscribe(() => {

        if (confirm('New version available. Load New Version?')) {

          window.location.reload();
        }
      });
    }
  }
}
