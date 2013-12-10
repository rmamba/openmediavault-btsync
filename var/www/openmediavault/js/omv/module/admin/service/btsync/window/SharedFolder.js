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
// require("js/omv/workspace/window/Form.js")
// require("js/omv/workspace/window/plugin/ConfigObject.js")
// require("js/omv/form/field/SharedFolderComboBox.js")

Ext.define("OMV.module.admin.service.btsync.window.SharedFolder", {
    extend : "OMV.workspace.window.Form",
    uses   : [
        "OMV.workspace.window.plugin.ConfigObject"
    ],

    plugins : [{
        ptype : "configobject"
    }],

    rpcService   : "Btsync",
    rpcSetMethod : "set",

    hideResetButton : true,
    uuid            : null,

    getFormItems : function() {
        var me = this;

        return [{
            xtype : "fieldset",
            title : _("General"),
            items : [{
                xtype      : "sharedfoldercombo",
                name       : "sharedfolderref",
                fieldLabel : _("Shared folder"),
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("The location needs to have at least read permissions for the user/group btsync")
                }]
            }]
        },{
            xtype : "fieldset",
            title : "Options",
            layout   : "column",
            defaults : {
                columnWidth : 0.5,
                layout      : 'form',
                border      : false,
            },
            items : [{
                defaults : {
                    hideLabel      : true,
                    labelSeparator : ''
                },
                items : [{
                    xtype      : "checkbox",
                    name       : "use_relay_server",
                    boxLabel   : _("Use relay server"),
                    checked    : true
                },{
                    xtype      : "checkbox",
                    name       : "use_tracker",
                    boxLabel   : _("Use tracker"),
                    checked    : true
                },{
                    xtype      : "checkbox",
                    name       : "use_dht",
                    boxLabel   : _("Use DHT"),
                    checked    : false
                }]
            },{
                defaults : {
                    hideLabel      : true,
                    labelSeparator : ''
                },
                items : [{
                    xtype      : "checkbox",
                    name       : "search_lan",
                    boxLabel   : _("Search LAN"),
                    checked    : true
                },{
                    xtype      : "checkbox",
                    name       : "use_sync_trash",
                    boxLabel   : _("Use sync trash"),
                    checked    : true
                }]
            }]
        }];
    }
});
