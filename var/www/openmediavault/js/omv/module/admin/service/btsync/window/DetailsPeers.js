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
    extend   : "OMV.workspace.grid.Panel",
    requires : [
        "OMV.data.Store",
        "OMV.data.Model"
    ],

    height : 400,

    hideAddButton     : true,
    hideEditButton    : true,
    hideDeleteButton  : true,
    hidePagingToolbar : false,

    title      : _("Peers"),
    autoReload : true,

    columns : [{
        header    : _("ID"),
        hidden    : true,
        dataIndex : "id"
    },{
        header    : _("Name"),
        flex      : 2,
        sortable  : true,
        dataIndex : "name"
    },{
        header    : _("Synced"),
        flex      : 2,
        sortable  : true,
        dataIndex : "synced",
        renderer  : function(value) {
            if (value !== 0) {
                return Ext.Date.format(new Date(value * 1000), "Y-m-d H:i:s");
            }

            return "Not synced";
        }
    },{
        header    : _("Download"),
        flex      : 1,
        sortable  : true,
        dataIndex : "download"
    },{
        header    : _("Upload"),
        flex      : 1,
        sortable  : true,
        dataIndex : "upload"
    }],

    initComponent : function() {
        var me = this;

        Ext.apply(me, {
            store : Ext.create("OMV.data.Store", {
                autoload   : true,
                remoteSort : false,
                model      : OMV.data.Model.createImplicit({
                    idProperty   : "uuid",
                    totalPoperty : "total",
                    fields       : [
                        { name : "id" },
                        { name : "connection" },
                        { name : "name" },
                        { name : "synced" },
                        { name : "download" },
                        { name : "upload" }
                    ]
                }),
                proxy : {
                    type    : "rpc",
                    rpcData : {
                        "service" : "Btsync",
                        "method"  : "getSharedFolderPeers"
                    },
                    extraParams : {
                        uuid : me.uuid
                    }
                }
            })
        });

        me.callParent(arguments);
    }
});
