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

require_once "openmediavault/object.inc";
require_once "openmediavault/error.inc";
require_once "openmediavault/util.inc";
require_once "openmediavault/rpc.inc";
require_once "openmediavault/notify.inc";
require_once "openmediavault/initscript.inc";
require_once "btsync/ApiInterface.php";
require_once "btsync/Api.php";

class OMVRpcServiceBtsync extends OMVRpcServiceAbstract
{
    private function getEventMessagePath()
    {
        return "org.openmediavault.services.btsync";
    }

    private function getXpath()
    {
        return "/config/services/btsync";
    }

    private function getSharedFoldersXpath()
    {
        return sprintf("%s/shared_folders", $this->getXpath(), $uuid);
    }

    private function getSharedFolderXpathByUuid($uuid)
    {
        return sprintf(
            "%s/shared_folder[uuid='%s']",
            $this->getSharedFoldersXpath(),
            $uuid
        );
    }

    public function getName()
    {
        return "Btsync";
    }

    public function initialize()
    {
        $this->registerMethod("getSettings");
        $this->registerMethod("setSettings");
        $this->registerMethod("getList");
        $this->registerMethod("getFilteredList");
        $this->registerMethod("getSharedFolderPeers");

        // CRUD
        $this->registerMethod("get");
        $this->registerMethod("set");
        $this->registerMethod("delete");
    }

    public function getSettings($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Get configuration object
        $object = $xmlConfig->get($this->getXpath());
        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXpath()
            );
        }

        // Modify result data
        $settingsObject["enable"] = boolval($object["enable"]);
        $settingsObject["device_name"] = $object["device_name"];
        $settingsObject["listening_port"] = intval($object["listening_port"]);
        $settingsObject["use_upnp"] = boolval($object["use_upnp"]);
        $settingsObject["lan_use_tcp"] = boolval($object["lan_use_tcp"]);
        $settingsObject["download_limit"] = intval($object["download_limit"]);
        $settingsObject["upload_limit"] = intval($object["upload_limit"]);

        $settingsObject["webui_enable"] = boolval($object["webui_enable"]);
        $settingsObject["webui_port"] = intval($object["webui_port"]);
        $settingsObject["webui_username"] = $object["webui_username"];
        $settingsObject["webui_password"] = $object["webui_password"];

        return $settingsObject;
    }

    public function setSettings($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "enable": { "type": "boolean" },
                    "device_name": { "type": "string" },
                    "listening_port": { "type": "integer" },
                    "use_upnp": { "type": "boolean" },
                    "lan_use_tcp": { "type": "boolean" },
                    "download_limit": { "type": "integer" },
                    "upload_limit": { "type": "integer" },

                    "webui_enable": { "type": "boolean" },
                    "webui_port": { "type": "integer", "minimum": 1024, "maximum": 65535 },
                    "webui_username": { "type": "string", "minLength": 3 },
                    "webui_password": { "type": "string", "minLength": 8 }
                }
            }'
        );

        // Get configuration object
        $oldConfig = $xmlConfig->get($this->getXpath());
        if (is_null($oldConfig)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXpath()
            );
        }

        // Prepare configuration data
        $object = array(
            "enable" => array_boolval($params, "enable"),
            "device_name" => $params["device_name"],
            "listening_port" => $params["listening_port"],
            "use_upnp" => array_boolval($params, "use_upnp"),
            "lan_use_tcp" => array_boolval($params, "lan_use_tcp"),
            "download_limit" => $params["download_limit"],
            "upload_limit" => $params["upload_limit"],

            "webui_enable" => array_boolval($params, "webui_enable"),
            "webui_port" => $params["webui_port"],
            "webui_username" => $params["webui_username"],
            "webui_password" => $params["webui_password"],

            "shared_folders" => $oldConfig["shared_folders"],
        );

        // Set configuration object
        if (false === $xmlConfig->replace($this->getXpath(), $object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED,
                $this->getXpath()
            );
        }

        unset($object["shared_folders"]);

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, $this->getEventMessagePath(), $object);

        return $object;
    }

    public function getList($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "start": { "type": "integer" },
                    "limit": {' . $GLOBALS["OMV_JSONSCHEMA_COUNTFIELD"] . '},
                    "sortfield": {' . $GLOBALS["OMV_JSONSCHEMA_SORTFIELD"] . '},
                    "sortdir": {' . $GLOBALS["OMV_JSONSCHEMA_SORTDIR"] . '}
                }
            }'
        );

        // Get configuration object
        $xpath = sprintf("%s/shared_folder/uuid", $this->getSharedFoldersXpath());
        $uuids = $xmlConfig->getList($xpath);

        if (is_null($uuids)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $xpath
            );
        }

        $sharedFolders = array();

        foreach ($uuids as $uuid) {
            try {
                $sharedFolders[] = $this->get(array("uuid" => $uuid), $context);
            } catch (Exception $e) {
                throw $e;
            }
        }

        return $this->applyFilter(
            $sharedFolders,
            $params["start"],
            $params["limit"],
            $params["sortfield"],
            $params["sortdir"]
        );
    }

    public function getFilteredList($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_USER
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "start": { "type": "integer" },
                    "limit": {' . $GLOBALS["OMV_JSONSCHEMA_COUNTFIELD"] . '},
                    "sortfield": {' . $GLOBALS["OMV_JSONSCHEMA_SORTFIELD"] . '},
                    "sortdir": {' . $GLOBALS["OMV_JSONSCHEMA_SORTDIR"] . '}
                }
            }'
        );

        $username = $context["username"];

        // Get configuration object
        $xpath = sprintf(
            "%s/shared_folder[users/user/username='%s']/uuid",
            $this->getSharedFoldersXpath(),
            $username
        );

        $uuids = $xmlConfig->getList($xpath);

        if (is_null($uuids)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $xpath
            );
        }

        $sharedFolders = array();

        foreach ($uuids as $uuid) {
            try {
                $folder = $this->get(array("uuid" => $uuid), $this->getAdminContext());

                $xpath = sprintf(
                    "%s/users/user[username='%s']/full_access",
                    $this->getSharedFolderXpathByUuid($uuid),
                    $username
                );

                $fullAccess = boolval($xmlConfig->get($xpath));

                $sharedFolders[] = array(
                    "uuid" => $folder["uuid"],
                    "dir" => $folder["dir"],
                    "secret" => $fullAccess ? $folder["secret"] : null,
                    "ro_secret" => $folder["ro_secret"]
                );
            } catch (Exception $e) {
                throw $e;
            }
        }

        return $this->applyFilter(
            $sharedFolders,
            $params["start"],
            $params["limit"],
            $params["sortfield"],
            $params["sortdir"]
        );
    }

    public function get($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "uuid": {' . $GLOBALS["OMV_JSONSCHEMA_UUID"] . '}
                }
            }'
        );

        $sharedFolder = $xmlConfig->get($this->getSharedFolderXpathByUuid(
            $params["uuid"]
        ));

        if (is_null($sharedFolder)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $xpath
            );
        }

        // Users
        if (empty($sharedFolder["users"]["user"])) {
            $sharedFolder["users"] = array();
        } else {
            $sharedFolder["users"] = $sharedFolder["users"]["user"];

            foreach ($sharedFolder["users"] as $user) {
                $user["full_access"] = boolval($user["full_access"]);
            }
        }

        // Get full path for presentation
        $sharedFolder["dir"] = $this->getSharedFolderPath(
            $sharedFolder["sharedfolderref"]
        );

        $api = $this->btsyncApiFactory();

        return $this->getSharedFolderPreferences($sharedFolder, $api);
    }

    public function set($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "uuid": {' . $GLOBALS["OMV_JSONSCHEMA_UUID_UNDEFINED"] . '},
                    "sharedfolderref": {' . $GLOBALS["OMV_JSONSCHEMA_UUID"] . '},
                    "use_relay_server": { "type": "boolean" },
                    "use_tracker": { "type": "boolean" },
                    "use_dht": { "type": "boolean" },
                    "search_lan": { "type": "boolean" },
                    "use_sync_trash": { "type": "boolean" },

                    "existing_secret": { "type": "string", "optional": true },

                    "users": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "username": { "type": "string" },
                                "full_access": { "type": "boolean" }
                            }
                        }
                    }
                }
            }'
        );

        $api = $this->btsyncApiFactory();

        $sharedFolder = array(
            "uuid" => empty($params["uuid"]) ? OMVUtil::uuid() : $params["uuid"],
            "sharedfolderref" => $params["sharedfolderref"],
            "users" => !empty($params["users"]) ?
                array("user" => $params["users"]) : array(),
        );

        $use_relay_server = boolval($params["use_relay_server"]);
        $use_tracker = boolval($params["use_tracker"]);
        $use_dht = boolval($params["use_dht"]);
        $search_lan = boolval($params["search_lan"]);
        $use_sync_trash = boolval($params["use_sync_trash"]);

        // Get old config
        $oldConfig = $xmlConfig->get($this->getSharedFolderXpathByUuid(
            $params["uuid"]
        ));

        if (!is_null($oldConfig)) {
            // Use old secret
            $sharedFolder["secret"] = $oldConfig["secret"];
            $sharedFolder["ro_secret"] = $oldConfig["ro_secret"];
        } else {
            $folder = null;
            $secrets = $api->getSecrets();

            if (!empty($params["existing_secret"])) {
                $secrets = $api->getSecrets($params["existing_secret"]);
            }

            $sharedFolder["ro_secret"] = $secrets->read_only;

            // Get dir path
            $dir = $this->getSharedFolderPath($sharedFolder["sharedfolderref"]);

            if (property_exists($secrets, "read_write")) {
                $sharedFolder["secret"] = $secrets->read_write;
                $folder = $api->addFolder($dir, true, $sharedFolder["secret"]);
            } else {
                $folder = $api->addFolder($dir, true, $sharedFolder["ro_secret"]);
            }
        }

        // Save configuration
        $success = false;
        $xpath = null;

        if (empty($params["uuid"])) {
            $success = $xmlConfig->set(
                $xpath = $this->getSharedFoldersXpath(),
                array("shared_folder" => $sharedFolder),
                $sharedFolder
            );
        } else {
            $success = $xmlConfig->replace(
                $xpath = $this->getSharedFolderXpathByUuid($params["uuid"]),
                $sharedFolder
            );
        }

        if (!$success) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_OBJECT_NOT_FOUND,
                $xpath
            );
        }

        $workingSecret = $this->getWorkingSecret($sharedFolder);

        $api->setFolderPreferences(
            $workingSecret,
            $use_relay_server,
            $use_tracker,
            $use_dht,
            $search_lan,
            $use_sync_trash
        );

        return $this->getSharedFolderPreferences($sharedFolder, $api);
    }

    public function delete($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "uuid": {' . $GLOBALS["OMV_JSONSCHEMA_UUID"] . '}
                }
            }'
        );

        $api = $this->btsyncApiFactory();

        // Get the shared folder
        $object = $xmlConfig->get($this->getSharedFolderXpathByUuid(
            $params["uuid"]
        ));

        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXpath()
            );
        }

        $workingSecret = $this->getWorkingSecret($object);

        // Remove it from Btsync
        $api->removeFolder($workingSecret);

        // Remove it from the config
        $sharedFolder = $xmlConfig->delete($this->getSharedFolderXpathByUuid(
            $params["uuid"]
        ));

        if (is_null($sharedFolder)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_OBJECT_NOT_FOUND,
                $this->getSharedFolderXpathByUuid($params["uuid"])
            );
        }
    }

    public function getSharedFolderPeers($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_EVERYONE
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "start": { "type": "integer" },
                    "limit": {' . $GLOBALS["OMV_JSONSCHEMA_COUNTFIELD"] . '},
                    "sortfield": {' . $GLOBALS["OMV_JSONSCHEMA_SORTFIELD"] . '},
                    "sortdir": {' . $GLOBALS["OMV_JSONSCHEMA_SORTDIR"] . '},
                    "uuid": {' . $GLOBALS["OMV_JSONSCHEMA_UUID"] . '}
                }
            }'
        );

        $api = $this->btsyncApiFactory();
        $sharedFolder = $xmlConfig->get($this->getSharedFolderXpathByUuid(
            $params["uuid"]
        ));
        $workingSecret = $this->getWorkingSecret($sharedFolder);

        // Filter result
        return $this->applyFilter(
            $api->getFolderPeers($workingSecret),
            $params["start"],
            $params["limit"],
            $params["sortfield"],
            $params["sortdir"]
        );
    }

    private function getSharedFolderPreferences($sharedFolder, \Btsync\ApiInterface $api)
    {
        $workingSecret = $this->getWorkingSecret($sharedFolder);

        $prefs = $api->getFolderPreferences($workingSecret);

        $sharedFolder["use_relay_server"] = $prefs->use_relay_server;
        $sharedFolder["use_tracker"] = $prefs->use_tracker;
        $sharedFolder["use_dht"] = $prefs->use_dht;
        $sharedFolder["search_lan"] = $prefs->search_lan;
        $sharedFolder["use_sync_trash"] = $prefs->use_sync_trash;

        return $sharedFolder;
    }

    private function btsyncApiFactory()
    {
        global $xmlConfig;

        $object = $xmlConfig->get($this->getXpath());

        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXpath()
            );
        }

        return new \Btsync\Api(
            $object["webui_username"],
            $object["webui_password"],
            $object["webui_port"]
        );
    }

    private function getWorkingSecret($sharedFolder)
    {
        $workingSecret = $sharedFolder["ro_secret"];

        if (!empty($sharedFolder["secret"])) {
            $workingSecret = $sharedFolder["secret"];
        }

        return $workingSecret;
    }

    private function getSharedFolderPath($sharedFolderReference)
    {
        global $xmlConfig;

        $xpath = sprintf(
            "//system/shares/sharedfolder[uuid='%s']",
            $sharedFolderReference
        );

        $sharedFolder = $xmlConfig->get($xpath);

        $xpath = sprintf(
            "//system/fstab/mntent[uuid='%s']",
            $sharedFolder["mntentref"]
        );

        $mountPoint = $xmlConfig->get($xpath);

        $path = sprintf(
            "%s/%s",
            $mountPoint["dir"],
            $sharedFolder["reldirpath"]
        );

        return $path;
    }
}

// Register the RPC service.
$rpcServiceMgr = &OMVRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new OMVRpcServiceBtsync());
