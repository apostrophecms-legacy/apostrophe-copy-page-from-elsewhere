const _ = require('lodash');

module.exports = {
  improve: 'apostrophe-pages',
  afterConstruct: function(self) {
    self.pushCopyPageFromElsewhereAssets();
  },
  construct: function(self, options) {
    self.copyPageFromElsewhereSchema = [
      {
        name: '_copy',
        label: 'Page to Copy From',
        type: 'joinByOne',
        withType: 'apostrophe-page',
        idField: 'copyId'
      }
    ];
    self.pushCopyPageFromElsewhereAssets = function() {
      self.pushAsset('script', 'user', { when: 'user' });
      self.pushAsset('script', 'modal', { when: 'user' });
    };
    var superSendPage = self.sendPage;    
    self.sendPage = function(req, template, data) {
      if (!(data.contextMenu && self.apos.permissions.can(req, 'edit', req.data.page))) {
        return superSendPage(req, template, data);
      }
      data.contextMenu = [
        ...data.contextMenu,
        {
          // Funny wording because of how apos.ui.link is designed
          action: 'copy-from-elsewhere-page',
          label: 'Copy Page From Elsewhere'
        }
      ];
      return superSendPage(req, template, data);
    };
    self.renderRoute('post', 'copy-page-from-elsewhere-modal', function(req, res, next) {
      return next(null, {
        template: 'copy-page-from-elsewhere-modal',
        data: {
          schema: self.copyPageFromElsewhereSchema
        }
      });
    });
    self.apiRoute('post', 'copy-page-from-elsewhere', async function(req, res, next) {
      const convert = require('util').promisify(self.apos.schemas.convert);
      const insert = require('util').promisify(self.apos.pages.insert);
      try {
        const peerId = self.apos.launder.id(req.body.peerId);
        const copyId = self.apos.launder.id(req.body.copyId);
        const peer = await self.apos.pages.find(req, {
          _id: peerId
        }).permission('edit').ancestors(true).toObject();
        if (!peer) {
          self.apos.utils.error('no peer');
          throw 'invalid';
        }
        const parent = _.last(peer._ancestors) || peer;
        const copy = await self.apos.pages.find(req, {
          _id: copyId
        }).permission(self.options.copyFromElsewhereWithoutEditPermission ? 'view': 'edit').toObject();
        if (!copy) {
          self.apos.utils.error('no copy source');
          throw 'invalid';
        }
        const schema = self.allowedSchema(req, copy, parent);
        const page = self.newChild(parent, copy.type);
        if (!self.isAllowedChildType(parent, page && page.type)) {
          self.apos.utils.error('disallowed page type');
          throw 'invalid';
        }
        const permissions = [
          'loginRequired',
          'viewUsersIds',
          'viewGroupsIds',
          'editUsersIds',
          'editGroupsIds',
          'docPermissions'
        ];
        for (const field of permissions) {
          delete copy[field];
        }
        await convert(req, schema, 'form', copy, page);
        // Permissions should always come from parent
        for (const field of permissions) {
          page[field] = parent[field];
        }
        // Copy top-level area properties which are not part of the schema
        // (introduced via apos.area)
        _.each(copy, function (val, key) {
          // Don't let typeof(null) === 'object' bite us
          if (val && (typeof (val) === 'object') && (val.type === 'area')) {
            page[key] = val;
          }
        });
        page.title = req.__('Copy of') + ' ' + page.title;
        page.slug = self.apos.utils.addSlashIfNeeded(parent.slug) + self.apos.utils.slugify(page.title);
        await insert(req, parent, page, {});
        const fetchedPage = await self.apos.pages.find(req, {
          _id: page._id
        }).toObject();
        return next(null, {
          _url: fetchedPage._url
        });
      } catch (e) {
        return next(e);
      }
    });
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function(req) {
      var options = superGetCreateSingletonOptions(req);
      options.copyPageFromElsewhereSchema = self.copyPageFromElsewhereSchema;
      self.apos.schemas.bless(req, options.copyPageFromElsewhereSchema);
      return options;
    };
  }
};
