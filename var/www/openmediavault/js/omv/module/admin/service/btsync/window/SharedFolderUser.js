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
// require("js/omv/workspace/window/Form.js")
// require("js/omv/form/field/UserComboBox.js")

Ext.define("OMV.module.admin.service.btsync.window.SharedFolderUser", {
    extend: "OMV.workspace.window.Form",

    mode: "local",
    width: 500,

    getFormItems: function() {
        return [{
            xtype: "usercombo",
            name: "username",
            fieldLabel: _("User"),
            userType: "normal",
            editable: false,
            allowNone: true
        }, {
            xtype: "checkbox",
            name: "full_access",
            fieldLabel: _("Full access"),
            checked: false
        }];
    }
});
