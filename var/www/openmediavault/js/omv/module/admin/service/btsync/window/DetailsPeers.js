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
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")
// require("js/omv/workspace/grid/Panel.js")

Ext.define("OMV.module.admin.service.btsync.window.DetailsPeers", {
    extend: "OMV.workspace.grid.Panel",
    requires: [
        "OMV.data.Store",
        "OMV.data.Model"
    ],

    title: _("Peers"),
    height: 400,

    autoReload: true,
    hideAddButton: true,
    hideEditButton: true,
    hideDeleteButton: true,
    hidePagingToolbar: false,

    columns: [{
        header: _("ID"),
        hidden: true,
        dataIndex: "id"
    }, {
        header: _("Name"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
    }, {
        header: _("Synced"),
        sortable: true,
        dataIndex: "synced",
        width: 120,
        renderer: function(value) {
            if (value !== 0) {
                return Ext.Date.format(new Date(value * 1000), "Y-m-d H:i:s");
            }

            return "Not synced";
        }
    }, {
        header: _("Download"),
        flex: 1,
        sortable: true,
        dataIndex: "download",
        renderer: function(value) {
            return this.rateRenderer(value);
        }
    }, {
        header: _("Upload"),
        flex: 1,
        sortable: true,
        dataIndex: "upload",
        renderer: function(value) {
            return this.rateRenderer(value);
        }
    }],

    initComponent: function() {
        Ext.apply(this, {
            store: Ext.create("OMV.data.Store", {
                autoLoad: true,
                remoteSort: false,
                model: OMV.data.Model.createImplicit({
                    idProperty: "uuid",
                    fields: [{
                        name: "id"
                    }, {
                        name: "connection"
                    }, {
                        name: "name"
                    }, {
                        name: "synced"
                    }, {
                        name: "download"
                    }, {
                        name: "upload"
                    }]
                }),
                proxy: {
                    type: "rpc",
                    rpcData: {
                        "service": "Btsync",
                        "method": "getSharedFolderPeers"
                    },
                    extraParams: {
                        uuid: this.uuid
                    }
                }
            })
        });

        this.callParent(arguments);
    },

    rateRenderer: function(value) {
        var suffixes = ["B", "KiB", "MiB", "GiB"];
        var suffix = suffixes[0];

        if (value !== 0) {
            for (var i = 0; i < suffixes.length; i++) {
                if (value < 1024) {
                    suffix = suffixes[i];

                    break;
                }

                value = value / 1024;
            }
        }

        value = value.toFixed(2);

        return value + " " + suffix + "/s";
    }
});
