<?php

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

namespace Btsync;

interface ApiInterface
{
    public function __construct($username, $password, $port = 8888, $host = "127.0.0.1");
    public function getFolders();
    public function getFolder($secret);
    public function addFolder($dir, $force = false, $secret = null);
    public function removeFolder($secret);
    public function getFolderPreferences($secret);
    public function setFolderPreferences(
        $secret,
        $use_relay_server,
        $use_tracker,
        $use_dht,
        $search_lan,
        $use_sync_trash,
        $useHosts = false,
        $selective_sync = false,
        $overwrite_changes = false
    );
    public function getFolderPeers($secret);
    public function getSecrets($secret = null);
}
