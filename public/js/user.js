apos.define('apostrophe-pages', {
  afterConstruct: function(self) {
    self.copyPageFromElsewhereEnableHandlers();
    self.copyPageFromElsewhereLaunchPageSettings();
  },
  construct: function(self, options) {
    self.copyPageFromElsewhereEnableHandlers = function() {
      apos.ui.link('apos-copy-from-elsewhere', 'page', function() {
        self.copyPageFromElsewhereModal();
      });
    };
    self.copyPageFromElsewhereModal = function() {
      apos.create('apostrophe-copy-page-from-elsewhere-modal', {
        action: self.action,
        schema: self.options.copyPageFromElsewhereSchema
      });
    };
    self.copyPageFromElsewhereLaunchPageSettings = function() {
      if (location.hash === '#apos-copied-page-from-elsewhere') {
        setImmediate(function() {
          self.pageSettings();
          window.history.replaceState(null, null, ' ');
        });
      }
    };
  }
});
