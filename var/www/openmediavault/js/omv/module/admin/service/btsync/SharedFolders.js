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
// require("js/omv/workspace/grid/Panel.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")
// require("js/omv/module/admin/service/btsync/window/Details.js")
// require("js/omv/module/admin/service/btsync/window/SharedFolder.js")

Ext.define("OMV.module.admin.service.btsync.SharedFolders", {
    extend: "OMV.workspace.grid.Panel",
    requires: [
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.data.proxy.Rpc",
        "OMV.module.admin.service.btsync.window.Details",
        "OMV.module.admin.service.btsync.window.SharedFolder"
    ],

    hidePagingToolbar: false,
    reloadOnActivate: true,

    columns: [{
        header: _("UUID"),
        hidden: true,
        dataIndex: "uuid"
    }, {
        header: _("Directory"),
        flex: 1,
        sortable: true,
        dataIndex: "dir"
    }, {
        header: _("Secret"),
        flex: 1,
        sortable: true,
        dataIndex: "secret"
    }, {
        header: _("Read-only secret"),
        flex: 1,
        sortable: true,
        dataIndex: "ro_secret"
    }],

    store: Ext.create("OMV.data.Store", {
        autoLoad: true,
        remoteSort: false,
        model: OMV.data.Model.createImplicit({
            idProperty: "uuid",
            fields: [{
                name: "uuid"
            }, {
                name: "dir"
            }, {
                name: "secret"
            }, {
                name: "ro_secret"
            }]
        }),
        proxy: {
            type: "rpc",
            rpcData: {
                "service": "Btsync",
                "method": "getList"
            }
        }
    }),

    getTopToolbarItems: function() {
        var items = this.callParent(arguments);

        Ext.Array.push(items, [{
            id: this.getId() + "-details",
            xtype: "button",
            text: _("Show details"),
            icon: "images/book.png",
            iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
            handler: Ext.Function.bind(this.onDetailsButton, this),
            scope: this,
            disabled: true,
            selectionConfig: {
                minSelections: 1,
                maxSelections: 1
            }
        }]);

        return items;
    },

    onAddButton: function() {
        Ext.create("OMV.module.admin.service.btsync.window.SharedFolder", {
            title: _("Add shared folder"),
            listeners: {
                scope: this,
                submit: function() {
                    this.doReload();
                }
            }
        }).show();
    },

    onEditButton: function() {
        var record = this.getSelected();

        Ext.create("OMV.module.admin.service.btsync.window.SharedFolder", {
            rpcGetMethod: "get",
            title: _("Edit shared folder"),
            uuid: record.get("uuid"),
            listeners: {
                scope: this,
                submit: function() {
                    this.doReload();
                }
            }
        }).show();
    },

    doDeletion: function(record) {
        OMV.Rpc.request({
            scope: this,
            callback: this.onDeletion,
            rpcData: {
                service: "Btsync",
                method: "delete",
                params: {
                    uuid: record.get("uuid")
                }
            }
        });
    },

    onDetailsButton: function() {
        var record = this.getSelected();

        if (!record)
            return;

        Ext.create("OMV.module.admin.service.btsync.window.Details", {
            uuid: record.get("uuid"),
            secret: record.get("secret"),
            ro_secret: record.get("ro_secret")
        }).show();
    }
});

OMV.WorkspaceManager.registerPanel({
    id: "sharedfolders",
    path: "/service/btsync",
    text: _("Shared folders"),
    position: 20,
    className: "OMV.module.admin.service.btsync.SharedFolders"
});
