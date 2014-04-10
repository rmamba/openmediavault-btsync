/**
 * Copyright (C) 2013-2014 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/window/Tab.js")
// require("js/omv/module/admin/service/btsync/window/SecretTab.js")

Ext.define("OMV.module.admin.service.btsync.window.Secret", {
    extend   : "OMV.workspace.window.Tab",
    requires : [
        "OMV.module.admin.service.btsync.window.SecretTab",
    ],

    title            : _("Secret / QR"),
    hideOkButton     : true,
    hideResetButton  : true,
    hideCancelButton : true,
    hideCloseButton  : false,

    getTabItems: function() {
        var me = this;

        var itemArray = [];

        if (me.secret) {
            itemArray.push(Ext.create("OMV.module.admin.service.btsync.window.SecretTab", {
                title      : _("Full access"),
                qrDataText : me.secret
            }));
        }

        itemArray.push(Ext.create("OMV.module.admin.service.btsync.window.SecretTab", {
            title      : _("Read-only"),
            qrDataText : me.ro_secret
        }));

        return itemArray;
    }
});
