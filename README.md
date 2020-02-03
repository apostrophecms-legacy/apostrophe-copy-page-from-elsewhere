# apostrophe-copy-page-from-elsewhere

## Why

By default, Apostrophe lets you copy a page, but the new page starts out as a peer of that page. Sometimes it is convenient to be able to pick a page to copy that is far away in the page tree, rather than dragging pages later via the reorganize view.

In addition, in some projects, it is helpful to allow users to copy pages they cannot edit. While this is a security concern for some, for others it is a useful feature. This module introduces an optional way to do that as well.

## How

```
# You should have a working Apostrophe project already at this point

npm install apostrophe-copy-page-from-elsewhere
```

And, in app.js, where you configure your `modules`:

```javascript
modules: {
  // Required to enable the feature
  'apostrophe-copy-page-from-elsewhere': {},
  'apostrophe-pages': {
    // Optional
    copyFromElsewhereWithoutEditPermission: true
  }
}
```

> Don't forget: the `copyFromElsewhereWithoutEditPermission` option must be configured for the `apostrophe-pages` module, not this module. That's because this module is really just an "improvement" to apostrophe-pages and contributes new capabilities to it.

## Using the feature

Once you enable the module, you will see an additional "Copy Page From Elsewhere" option on the Page Settings menu, complementing the existing "Copy Page" option.

Select the option and you will be prompted to choose a page. You can start typing a page title, or click Browse to browse for any page on the site.

Once you have selected a page, click Copy. The page is copied, and you are redirected there. Then, you are invited to edit the page settings. You will want to do this in order to give the page the right title, at a minimum.

> Just like with "Copy Page," your new page will be a *peer* of the page where you clicked "Copy Page From Elsewhere," unless you clicked it on the home page, in which case it will be a child.

## Permissions note

When you create a page in this way, all of its content and settings come from the copied page, except for permissions settings. Permissions settings are inherited from the parent.
