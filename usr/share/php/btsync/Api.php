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

require_once "btsync/ApiInterface.php";

class Api implements ApiInterface
{
    private $username;
    private $password;
    private $host;
    private $port;

    public function __construct($username, $password, $port = 8888, $host = "127.0.0.1")
    {
        $this->username = $username;
        $this->password = $password;
        $this->port = $port;
        $this->host = $host;
    }

    public function getFolders()
    {
        return $this->makeCall("get_folders");
    }

    public function getFolder($secret)
    {
        $params = array(
            "secret" => $secret,
        );

        $result = $this->makeCall("get_folders", $params);

        if (empty($result)) {
            return null;
        }

        return reset($result);
    }

    public function addFolder($dir, $secret = null)
    {
        $params = array(
            "dir" => $dir,
        );

        if ($secret != null) {
            $params["secret"] = $secret;
        }

        return $this->makeCall("add_folder", $params);
    }

    public function removeFolder($secret)
    {
        $params = array(
            "secret" => $secret,
        );

        return $this->makeCall("remove_folder", $params);
    }

    public function getFolderPreferences($secret)
    {
        $params = array(
            "secret" => $secret,
        );

        $result = $this->makeCall("get_folder_prefs", $params);

        $this->convertIntegerPropertyToBoolean($result, "use_relay_server");
        $this->convertIntegerPropertyToBoolean($result, "use_tracker");
        $this->convertIntegerPropertyToBoolean($result, "use_dht");
        $this->convertIntegerPropertyToBoolean($result, "search_lan");
        $this->convertIntegerPropertyToBoolean($result, "use_sync_trash");
        $this->convertIntegerPropertyToBoolean($result, "use_hosts");
        $this->convertIntegerPropertyToBoolean($result, "selective_sync");
        $this->convertIntegerPropertyToBoolean($result, "overwrite_changes");

        return $result;
    }

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
    ) {
        $params = array(
            "secret" => $secret,
            "use_relay_server" => $use_relay_server === true ? 1 : 0,
            "use_tracker" => $use_tracker === true ? 1 : 0,
            "use_dht" => $use_dht === true ? 1 : 0,
            "search_lan" => $search_lan === true ? 1 : 0,
            "use_sync_trash" => $use_sync_trash === true ? 1 : 0,
            "use_hosts" => $use_hosts === true ? 1 : 0,
            "selective_sync" => $selective_sync === true ? 1 : 0,
            "overwrite_changes" => $overwrite_changes === true ? 1 : 0,
        );

        $result = $this->makeCall("set_folder_prefs", $params);

        $this->convertIntegerPropertyToBoolean($result, "use_relay_server");
        $this->convertIntegerPropertyToBoolean($result, "use_tracker");
        $this->convertIntegerPropertyToBoolean($result, "use_dht");
        $this->convertIntegerPropertyToBoolean($result, "search_lan");
        $this->convertIntegerPropertyToBoolean($result, "use_sync_trash");
        $this->convertIntegerPropertyToBoolean($result, "use_hosts");
        $this->convertIntegerPropertyToBoolean($result, "selective_sync");
        $this->convertIntegerPropertyToBoolean($result, "overwrite_changes");

        return $result;
    }

    public function getFolderPeers($secret)
    {
        $params = array();

        if ($secret != null) {
            $params["secret"] = $secret;
        }

        return $this->makeCall("get_folder_peers", $params);
    }

    public function getSecrets($secret = null)
    {
        $params = array();

        if ($secret != null) {
            $params["secret"] = $secret;
        }

        return $this->makeCall("get_secrets", $params);
    }

    private function makeCall($method, $params = array())
    {
        $paramsQuery = "";

        foreach ($params as $param => $value) {
            $paramsQuery .= "&" . $param . "=" . $value;
        }

        $url = sprintf(
            "http://%s:%s/api?method=%s%s",
            $this->host,
            $this->port,
            $method,
            $paramsQuery
        );

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Authorization: Basic " . base64_encode($this->username . ":" . $this->password),
        ));
        curl_setopt($ch, CURLOPT_FAILONERROR, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            throw new \Exception("Curl failed with error code: " . curl_errno($ch));
        }

        $result = json_decode($response);

        // Check for errors and throw an exception if one occured
        if (is_object($result)) {
            if (property_exists($result, "error")) {
                if ($result->error != 0) {
                    $code = $result->error;
                    $message = "Btsync request failed. Code: " . $code;

                    if (property_exists($result, "message")) {
                        $message .= ". Message: " . $result->message;
                    }

                    throw new \Exception($message, $code);
                }
            }
        }

        return $result;
    }

    private function convertIntegerPropertyToBoolean($obj, $property)
    {
        $obj->{$property} = boolval($obj->{$property});
    }
}
