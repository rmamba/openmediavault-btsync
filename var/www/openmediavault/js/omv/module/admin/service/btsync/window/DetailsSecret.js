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
// require("js/omv/form/Panel.js")
// require("js/omv/module/admin/service/btsync/libs/jsqr-0.2-min.js")

Ext.define("OMV.module.admin.service.btsync.window.DetailsSecret", {
    extend: "OMV.form.Panel",

    bodyPadding: "5 5 0",

    initComponent: function() {
        var qrImage = this.generateQrCodeImage("btsync://" + this.qrDataText);

        Ext.apply(this, {
            items: [{
                xtype: "textfield",
                value: this.qrDataText
            }, {
                html: "<img height='376' width='376' style='width:100%;' src='" + qrImage + "' />",
                margin: "0 0 10 0"
            }]
        });

        this.callParent(arguments);
    },

    generateQrCodeImage: function(data) {
        var qr = new JSQR();
        var code = new qr.Code();

        code.encodeMode = code.ENCODE_MODE.BYTE;
        code.version = code.DEFAULT;
        code.errorCorrection = code.ERROR_CORRECTION.H;

        var input = new qr.Input();
        input.dataType = input.DATA_TYPE.TEXT;
        input.data = data;

        var matrix = new qr.Matrix(input, code);

        matrix.scale = 4;
        matrix.margin = 2;

        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", matrix.pixelWidth);
        canvas.setAttribute("height", matrix.pixelWidth);
        canvas.getContext("2d").fillStyle = "rgb(0,0,0)";
        matrix.draw(canvas, 0, 0);

        // Convert canvas to image data URL
        var imageSrc = canvas.toDataURL("image/png");

        return imageSrc;
    }
});
