const Backbone = require('backbone');
const SettingsStore = require('../comp/settings-store');

const AppSettingsModel = Backbone.Model.extend({
    defaults: {
        theme: 'fb',
        locale: null,
        expandGroups: true,
        listViewWidth: null,
        menuViewWidth: null,
        tagsViewHeight: null,
        autoUpdate: 'install',
        clipboardSeconds: 0,
        autoSave: true,
        autoSaveInterval: 0,
        rememberKeyFiles: false,
        idleMinutes: 15,
        minimizeOnClose: false,
        tableView: false,
        colorfulIcons: false,
        directAutotype: true,
        titlebarStyle: 'default',
        lockOnMinimize: true,
        lockOnCopy: false,
        lockOnAutoType: false,
        lockOnOsLock: false,
        helpTipCopyShown: false,
        templateHelpShown: false,
        skipOpenLocalWarn: false,
        hideEmptyFields: false,
        skipHttpsWarning: false,
        demoOpened: false,
        fontSize: 0,
        tableViewColumns: null,
        generatorPresets: null,
        generatorHidePassword: false,
        cacheConfigSettings: false,

        canOpen: true,
        canOpenDemo: true,
        canOpenSettings: true,
        canCreate: true,
        canImportXml: true,
        canRemoveLatest: true,

        dropbox: true,
        webdav: true,
        gdrive: true,
        onedrive: true
    },

    initialize() {
        this.listenTo(this, 'change', this.save);
    },

    load() {
        return SettingsStore.load('app-settings').then(data => {
            if (data) {
                this.upgrade(data);
                this.set(data, { silent: true });
            }
        });
    },

    upgrade(data) {
        if (data.rememberKeyFiles === true) {
            data.rememberKeyFiles = 'data';
        }
        if (data.versionWarningShown) {
            delete data.versionWarningShown;
        }
    },

    save() {
        SettingsStore.save('app-settings', this.attributes);
    }
});

AppSettingsModel.instance = new AppSettingsModel();

module.exports = AppSettingsModel;
