var syncIntervals = {
  0: 0,         // never
  1: 1,         // every minute
  2: 10,        // every 10 minutes
  3: 60,
  4: 60 * 6,
  5: 60 * 12,
  6: 60 * 24
};

window.onload = function() {
  function App() {
  }
  App.prototype = {
    manifestURL: 'manifest.webapp',

    _install: function() {
      console.log("** Installing ... ");
      var request = navigator.mozApps.install(this.manifestURL);

      request.onsuccess = this.run.bind(this);
      request.onerror = this.error.bind(this);
    },

    _checkInstalled: function(callback) {
      console.log("** Checking whether I'm installed");
      var request = navigator.mozApps.checkInstalled(this.manifestURL);
      var installButton = document.getElementById('button.install');

      request.onsuccess = function() {
        if(request.result) {
          console.log("** Successfully installed!  \\o/");
          installButton.style.display = 'none';
          this.run();
        } else {
          console.log("** Not installed yet");
          installButton.addEventListener('click', this._install.bind(this), false);
        };
      }.bind(this);
    },

    init: function() {
      this._checkInstalled();
    },

    run: function() {
      console.log("** Starting the app");
      // toolkit/modules/SyncScheduler.jsm will emit a 'sync' system
      // message when it's time for us to sync.
      navigator.mozSetMessageHandler('sync', function() {
        this.sync();
      }.bind(this));

      // When we change the repeating sync index
      document.getElementById('sync-repeat').onchange = function(e) {
        if (this.selectedIndex === 0) {
          navigator.syncScheduler.unregisterSync("sync-demo");
        } else {
          navigator.syncScheduler.requestSync("sync-demo", {
            description: "do this thing",
            minInterval: syncIntervals[this.selectedIndex],
            repeating: true
          });
        }
      };

      // When we press the Sync ASAP button
      document.getElementById('sync-now').onclick = function(e) {
        navigator.syncScheduler.requestSync("sync-demo", {
          description: "do this thing"
        });
      };

      // Kick things off by requesting periodic sync
      // (at a ludicrously short interval)
      navigator.syncScheduler.requestSync("sync-demo", {
        description: "Pull down @mozilla tweets",
        minInterval: 5,   // (seconds) short interval for testing
        repeating: true
      });

    },

    sync: function() {
      var message = "Ohai!  New sync message!";
      console.log("** " + message);

      document.getElementById('feedback').innerHTML =
        "Received last message at " + Date.now();

      CoolClock.config.clockTracker["clock"].time = new Date();

      // if (Notification.permission == "granted") {
      //   new Notification(message);
      // } else {
      //   this.error("What? Can't display a notification???");
      // }
    },

    error: function(name) {
      console.error("** Error: " + JSON.stringify(name));
    }
  };

  console.log("** Instantiating sync thing app");
  var app = new App();
  app.init();
};
