/**
 * Copyright (C) 2013 OpenMediaVault Plugin Developers
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
// require("js/omv/module/admin/service/btsync/window/SharedFolder.js")

Ext.define('OMV.module.admin.service.btsync.SharedFolders', {
    extend   : "OMV.workspace.grid.Panel",
    requires : [
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.data.proxy.Rpc",
        "OMV.module.admin.service.btsync.window.SharedFolder"
    ],

    hidePagingToolbar : false,

    columns : [{
        header    : _("UUID"),
        hidden    : true,
        dataIndex : "uuid"
    },{
        header    : _("Directory"),
        flex      : 1,
        sortable  : true,
        dataIndex : "dir"
    },{
        header    : _("Secret"),
        flex      : 1,
        sortable  : true,
        dataIndex : "secret"
    }],

    initComponent : function() {
        var me = this;

        Ext.apply(me, {
            store : Ext.create("OMV.data.Store", {
                autoload   : true,
                remoteSort : false,
                model      : OMV.data.Model.createImplicit({
                    idProperty   : 'uuid',
                    totalPoperty : 'total',
                    fields       : [
                        { name : 'uuid' },
                        { name : 'dir' },
                        { name : 'secret' }
                    ]
                }),
                proxy : {
                    type    : 'rpc',
                    rpcData : {
                        "service" : "Btsync",
                        "method"  : "getList"
                    }
                }
            })
        });

        me.doReload();

        me.callParent(arguments);
    },

    onAddButton : function() {
        var me = this;

        Ext.create("OMV.module.admin.service.btsync.window.SharedFolder", {
            title        : _("Add shared folder"),
            listeners    : {
                scope  : me,
                submit : function() {
                    me.doReload();
                }
            }
        }).show();
    },

    onEditButton : function() {
        var me = this;
        var record = me.getSelected();

        Ext.create("OMV.module.admin.service.btsync.window.SharedFolder", {
            rpcGetMethod : "get",
            title        : _("Edit shared folder"),
            uuid         : record.get('uuid'),
            listeners    : {
                scope  : me,
                submit : function() {
                    me.doReload();
                }
            }
        }).show();
    },

    doDeletion : function(record) {
        var me = this;

        OMV.Rpc.request({
            scope : me,
            callback : me.onDeletion,
            rpcData : {
                service : "Btsync",
                method : "delete",
                params : {
                    uuid : record.get("uuid")
                }
            }
        });
    }

});

OMV.WorkspaceManager.registerPanel({
    id        : "sharedfolders",
    path      : "/service/btsync",
    text      : _("Shared folders"),
    position  : 20,
    className : "OMV.module.admin.service.btsync.SharedFolders"
});
