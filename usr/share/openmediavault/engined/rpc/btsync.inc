<?php

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

require_once "openmediavault/object.inc";
require_once "openmediavault/error.inc";
require_once "openmediavault/util.inc";
require_once "openmediavault/rpc.inc";
require_once "openmediavault/notify.inc";

class OMVRpcServiceBtsync extends OMVRpcServiceAbstract
{
    private function getXPath()
    {
        return "//services/btsync";
    }

    private function getSharedFoldersXPath()
    {
        return sprintf("%s/shared_folders", $this->getXPath(), $uuid);
    }

    private function getSharedFolderXPathByUuid($uuid)
    {
        return sprintf("%s/shared_folder[uuid='%s']", $this->getSharedFoldersXPath(), $uuid);
    }

    public function getName()
    {
        return 'Btsync';
    }

    public function initialize()
    {
        $this->registerMethod('getSettings');
        $this->registerMethod('setSettings');
        $this->registerMethod('getList');

        // CRUD
        $this->registerMethod('get');
        $this->registerMethod('set');
        $this->registerMethod('delete');
    }

    public function getSettings($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Get configuration object
        $object = $xmlConfig->get($this->getXPath());
        if (is_null($object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath());

        // Modify result data
        $settingsObject['enable']         = boolval($object['enable']);
        $settingsObject['listening_port'] = intval($object['listening_port']);
        $settingsObject['use_upnp']         = boolval($object['use_upnp']);
        $settingsObject['download_limit'] = intval($object['download_limit']);
        $settingsObject['upload_limit']   = intval($object['upload_limit']);

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
        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "enable"         : { "type" : "boolean" },
                "listening_port" : { "type" : "integer" },
                "use_upnp"       : { "type" : "boolean" },
                "download_limit" : { "type" : "integer" },
                "upload_limit"   : { "type" : "integer" }
            }
        }');

        // Get configuration object
        $oldConfig = $xmlConfig->get($this->getXPath());
        if (is_null($oldConfig))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath());

        // Prepare configuration data
        $object = array(
            "enable"         => array_boolval($params, 'enable'),
            'listening_port' => $params['listening_port'],
            'use_upnp'       => array_boolval($params, 'use_upnp'),
            'download_limit' => $params['download_limit'],
            'upload_limit'   => $params['upload_limit'],
            'shared_folders' => $oldConfig['shared_folders'],
        );

        // Set configuration object
        if (false === $xmlConfig->replace($this->getXPath(), $object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED,
                $this->getXPath());

        unset($object['shared_folders']);

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, "org.openmediavault.services.btsync", $object);

        return $object;
    }

    function getList($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "start"     : { "type" : "integer" },
                "limit"     : {' . $GLOBALS['OMV_JSONSCHEMA_COUNTFIELD'] . '},
                "sortfield" : {' . $GLOBALS['OMV_JSONSCHEMA_SORTFIELD'] . '},
                "sortdir"   : {' . $GLOBALS['OMV_JSONSCHEMA_SORTDIR'] . '}
            }
        }');

        // Get configuration object
        $xPath = sprintf("%s/shared_folder/uuid", $this->getSharedFoldersXPath());
        $uuids = $xmlConfig->getList($xPath);

        if (is_null($uuids))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $xPath);

        $sharedFolders = array();

        foreach ($uuids as $uuid) {
            try {
                $sharedFolders[] = $this->get(array('uuid' => $uuid), $context);
            } catch (Exception $e) {
                throw $e;
            }
        }

        return $this->applyFilter(
            $sharedFolders,
            $params['start'],
            $params['count'],
            $params['sortfield'],
            $params['sortdir']
        );
    }

    function get($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "uuid" : {' . $GLOBALS['OMV_JSONSCHEMA_UUID_NONE'] . '}
            }
        }');

        $sharedFolder = $xmlConfig->get($this->getSharedFolderXPathByUuid($params['uuid']));

        if (is_null($sharedFolder))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $xPath);

        $sharedFolder['use_relay_server'] = boolval($sharedFolder['use_relay_server']);
        $sharedFolder['use_tracker']      = boolval($sharedFolder['use_tracker']);
        $sharedFolder['use_dht']          = boolval($sharedFolder['use_dht']);
        $sharedFolder['search_lan']       = boolval($sharedFolder['search_lan']);
        $sharedFolder['use_sync_trash']   = boolval($sharedFolder['use_sync_trash']);

        return $sharedFolder;
    }

    public function set($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "uuid"             : {' . $GLOBALS['OMV_JSONSCHEMA_UUID_UNDEFINED'] . '},
                "sharedfolderref"  : {' . $GLOBALS['OMV_JSONSCHEMA_UUID'] . '},
                "use_relay_server" : { "type" : "boolean" },
                "use_tracker"      : { "type" : "boolean" },
                "use_dht"          : { "type" : "boolean" },
                "search_lan"       : { "type" : "boolean" },
                "use_sync_trash"   : { "type" : "boolean" }
            }
        }');

        $sharedFolder = array(
            'uuid'             => empty($params['uuid']) ? OMVUtil::uuid() : $params['uuid'],
            'sharedfolderref'  => $params['sharedfolderref'],
            'use_relay_server' => boolval($params['use_relay_server']),
            'use_tracker'      => boolval($params['use_tracker']),
            'use_dht'          => boolval($params['use_dht']),
            'search_lan'       => boolval($params['search_lan']),
            'use_sync_trash'   => boolval($params['use_sync_trash']),
        );

        // Get old config
        $oldConfig = $xmlConfig->get($this->getSharedFolderXPathByUuid($params['uuid']));

        if (is_null($oldConfig)) {
            // Generate secret if new
            $cmd = "btsync --generate-secret 2>&1";

            if (0 !== $this->exec($cmd, $output))
                throw new OMVException(OMVErrorMsg::E_EXEC_FAILED,
                    $cmd, implode("\n", $output));

            $sharedFolder['secret'] = $output;
        } else {
            // Use old secret
            $sharedFolder['secret'] = $oldConfig['secret'];
        }

        // Save configuration
        $success = false;
        $xPath = null;

        if (empty($params['uuid']))
            $success = $xmlConfig->set($xPath = $this->getSharedFoldersXPath(),
                array('shared_folder' => $sharedFolder),
                $sharedFolder);
        else
            $success = $xmlConfig->replace($xPath = $this->getSharedFolderXPathByUuid($params['uuid']),
                $sharedFolder);

        if (!$success)
            throw new OMVException(OMVErrorMsg::E_CONFIG_OBJECT_NOT_FOUND,
                $xPath);

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(empty($params['uuid']) ? OMV_NOTIFY_CREATE : OMV_NOTIFY_MODIFY,
            "org.openmediavault.services.btsync", $sharedFolder);

        return $sharedFolder;
    }

    public function delete($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "uuid" : {' . $GLOBALS['OMV_JSONSCHEMA_UUID_NONE'] . '}
            }
        }');

        $sharedFolder = $xmlConfig->delete($this->getSharedFolderXPathByUuid($params['uuid']));

        if (is_null($sharedFolder))
            throw new OMVException(OMVErrorMsg::E_CONFIG_OBJECT_NOT_FOUND,
                $this->getSharedFolderXPathByUuid($params['uuid']));

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_DELETE,
            "org.openmediavault.services.btsync", $sharedFolder);
    }
}

// Register the RPC service.
$rpcServiceMgr = &OMVRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new OMVRpcServiceBtsync());