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
        document.getElementById('feedback').innerHTML =
          "Received sync system message at " + Date.now();
      });

      // Kick things off by requesting periodic sync
      // (at a ludicrously short interval)
      navigator.syncScheduler.requestSync("sync-demo", {
        description: "Pull down @mozilla tweets",
        minInterval: 10 * 1000,   // (ms) short interval for testing
        repeating: true
      });
    },

    sync: function() {
    },

    error: function(name) {
      console.error("** Error: " + JSON.stringify(name));
    }
  };

  console.log("** Instantiating sync thing app");
  var app = new App();
  app.init();
};