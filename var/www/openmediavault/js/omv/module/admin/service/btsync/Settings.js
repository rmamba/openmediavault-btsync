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
// require("js/omv/workspace/form/Panel.js")

Ext.define("OMV.module.admin.service.btsync.Settings", {
    extend : "OMV.workspace.form.Panel",

    rpcService   : "Btsync",
    rpcGetMethod : "getSettings",
    rpcSetMethod : "setSettings",

    getFormItems : function() {
        var me = this;

        return [{
            xtype    : "fieldset",
            title    : "General settings",
            defaults : {
                labelSeparator : ""
            },
            items : [{
                xtype      : "checkbox",
                name       : "enable",
                fieldLabel : _("Enable"),
                checked    : false
            },{
                xtype         : "numberfield",
                name          : "listening_port",
                fieldLabel    : _("Listening port"),
                minValue      : 0,
                maxValue      : 65535,
                allowDecimals : false,
                allowNegative : false,
                allowBlank    : false,
                value         : 0,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("0 - randomize port")
                }]
            },{
                xtype      : "checkbox",
                name       : "use_upnp",
                fieldLabel : _("Use UPnP"),
                checked    : true
            },{
                xtype         : "numberfield",
                name          : "download_limit",
                fieldLabel    : _("Download limit"),
                allowDecimals : false,
                allowNegative : false,
                allowBlank    : false,
                value         : 0,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("0 - no limit")
                }]
            },{
                xtype         : "numberfield",
                name          : "upload_limit",
                fieldLabel    : _("Upload limit"),
                allowDecimals : false,
                allowNegative : false,
                allowBlank    : false,
                value         : 0,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("0 - no limit")
                }]
            }]
        }];
    }
});

OMV.WorkspaceManager.registerPanel({
    id        : "settings",
    path      : "/service/btsync",
    text      : _("Settings"),
    position  : 10,
    className : "OMV.module.admin.service.btsync.Settings"
});
