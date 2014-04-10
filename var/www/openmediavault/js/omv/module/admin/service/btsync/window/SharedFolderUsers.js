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
// require("js/omv/module/admin/service/btsync/window/SharedFolderUser.js")

Ext.define("OMV.module.admin.service.btsync.window.SharedFolderUsers", {
    extend   : "OMV.workspace.grid.Panel",
    requires : [
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.module.admin.service.btsync.window.SharedFolderUser"
    ],

    title  : _("Users"),
    mode   : "local",
    height : 200,

    columns : [{
        header    : _("User"),
        flex      : 1,
        sortable  : true,
        dataIndex : "username"
    },{
        xtype     : "booleaniconcolumn",
        header    : _("Full access"),
        sortable  : true,
        dataIndex : "full_access",
        align     : "center",
        width     : 80,
        resizable : false,
        trueIcon  : "switch_on.png",
        falseIcon : "switch_off.png"
    }],

    initComponent : function() {
        var me = this;

        Ext.apply(me, {
            store : Ext.create("OMV.data.Store", {
                autoLoad : false,
                model    : OMV.data.Model.createImplicit({
                    idProperty : "username",
                    fields     : [
                        { name : "username", type : "string" },
                        { name : "full_access", type: "boolean" }
                    ]
                }),
                proxy : {
                    type   : "memory",
                    reader : {
                        type : "json"
                    },
                    sorters : [{
                        direction : "ASC",
                        property  : "username"
                    }]
                }
            })
        });

        me.callParent(arguments);
    },

    onAddButton: function() {
        var me = this;
        Ext.create("OMV.module.admin.service.btsync.window.SharedFolderUser", {
            title     : _("Add user"),
            listeners : {
                scope  : me,
                submit : function(wnd, values) {
                    var store = this.getStore();

                    // Create and insert new record.
                    var newRecord = new store.model();
                    newRecord.beginEdit();
                    newRecord.set(values);
                    newRecord.endEdit();
                    store.add(newRecord);
                }
            }
        }).show();
    },

    onEditButton: function() {
        var me = this;
        var record = me.getSelected();

        var wnd = Ext.create("OMV.module.admin.service.btsync.window.SharedFolderUser", {
            title     : _("Edit user"),
            listeners : {
                scope  : me,
                submit : function(wnd, values) {
                    record.beginEdit();
                    record.set(values);
                    record.endEdit();
                }
            }
        });

        wnd.setValues(record.data);
        wnd.show();
    },

    setValues: function(values) {
        var me = this;

        return me.callParent([ values.users ]);
    },

    getValues: function() {
        var me = this;
        var values = me.callParent(arguments);

        return {
            users : values
        };
    }
});
