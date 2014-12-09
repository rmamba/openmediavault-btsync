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
// require("js/omv/module/admin/service/btsync/window/DetailsSecret.js")
// require("js/omv/module/admin/service/btsync/window/DetailsPeers.js")

Ext.define("OMV.module.admin.service.btsync.window.Details", {
    extend: "OMV.workspace.window.Tab",
    requires: [
        "OMV.module.admin.service.btsync.window.DetailsSecret",
        "OMV.module.admin.service.btsync.window.DetailsPeers"
    ],

    title: _("Details / Secret / QR"),
    hideOkButton: true,
    hideResetButton: true,
    hideCancelButton: true,
    hideCloseButton: false,

    getTabItems: function() {
        var itemArray = [];

        if (this.secret) {
            itemArray.push(Ext.create("OMV.module.admin.service.btsync.window.DetailsSecret", {
                title: _("Full access"),
                qrDataText: this.secret
            }));
        }

        itemArray.push(Ext.create("OMV.module.admin.service.btsync.window.DetailsSecret", {
            title: _("Read-only"),
            qrDataText: this.ro_secret
        }));

        itemArray.push(Ext.create("OMV.module.admin.service.btsync.window.DetailsPeers", {
            uuid: this.uuid
        }));

        return itemArray;
    }
});
