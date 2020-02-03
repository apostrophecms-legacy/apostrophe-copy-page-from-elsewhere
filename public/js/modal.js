apos.define('apostrophe-copy-page-from-elsewhere-modal', {
  extend: 'apostrophe-modal',
  source: 'copy-page-from-elsewhere-modal',
  construct: function(self, options) {
    self.schema = self.options.schema;
    self.beforeShow = function(callback) {
      // We don't have an existing setting but we do need to enable the UI for the various fields
      return apos.schemas.populate(self.$el.find('[data-schema-fields]'), self.schema, {}, callback);
    },
    self.saveContent = function(callback) {
      var data = {};
      var result;
      return async.series([
        convert,
        copy
      ], function(err) {
        if (err) {
          apos.notify('The page could not be copied. That page type might not be allowed in this location.', { type: 'error' });
          return callback(err);
        }
        window.location.href = result._url + '#apos-copied-page-from-elsewhere';
      });
      function convert(callback) {
        return apos.schemas.convert(self.$el.find('[data-schema-fields]'), self.schema, data, {}, callback);
      }
      function copy(callback) {
        return self.api('copy-page-from-elsewhere', {
          peerId: apos.pages.page._id,
          copyId: data.copyId
        }, function(_result) {
          if (_result.status !== 'ok') {
            return callback(_result.status);
          }
          result = _result;
          return callback(null);
        }, function (err) {
          return callback(err);
        });
      }
    };
  }
});
