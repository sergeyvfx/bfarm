#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# ***** BEGIN GPL LICENSE BLOCK *****
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software  Foundation,
# Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
#
# The Original Code is Copyright (C) 2010 by Sergey Sharybin
# All rights reserved.
#
# The Original Code is: all of this file.
#
# Contributor(s): none yet.
#
# ***** END GPL LICENSE BLOCK *****
#

import time
import threading

from config import Config


class RenderNode:
    """
    Renderfarm node descriptor
    """

    total_nodes = 0

    def __init__(self, host_info, client_info):
        """
        Initialize node descriptor
        """

        self.uuid = str(RenderNode.total_nodes)
        self.ip = client_info['address'][0]
        self.access_time = time.time()
        self.enabled = True
        self.host_info = host_info

        RenderNode.total_nodes += 1

        self.tasks_lock = threading.Lock()
        self.tasks = []

    def getUUID(self):
        """
        Get UUID of node
        """

        return self.uuid

    def isAlive(self):
        """
        Check is node still alive or could be dropped
        """

        cur = time.time()
        max_age = Config.master['slave_max_age']

        return cur - self.access_time <= max_age

    def touch(self):
        """
        Touch node to update last access time
        """

        self.access_time = time.time()

    def isEnabled(self):
        """
        Check if node enabled
        """

        return self.enabled

    def setEnabled(self, enabled):
        """
        Set enabled flag
        """

        self.enabled = enabled

    def getIP(self):
        """
        Get IP address of node
        """

        return self.ip

    def assignTask(self, jobUUID, task_nr):
        """
        Assign task to node
        """

        with self.tasks_lock:
            if jobUUID is None:
                self.tasks = []
            else:
                self.tasks.append({'jobUUID': jobUUID,
                                   'task_nr': task_nr})

    def unassignTask(self, jobUUID, task_nr):
        """
        Unassigns task from node
        """

        with self.tasks_lock:
            for t in self.tasks:
                if t['jobUUID'] == jobUUID and t['task_nr'] == task_nr:
                    self.tasks.remove(t)
                    return

    def hasTask(self, jobUUID, task_nr):
        """
        Check if node has assigned task
        """

        with self.tasks_lock:
            for t in self.tasks:
                if t['jobUUID'] == jobUUID and t['task_nr'] == task_nr:
                    return True

        return False

    def getTasks(self):
        """
        Get all assigned task
        """

        with self.tasks_lock:
            tasks = self.tasks[:]

        return tasks

    def getHostname(self):
        """
        Get hostname of node machine
        """

        if 'hostname' in self.host_info:
            return self.host_info['hostname']

        return self.ip

    def getHostInfo(self):
        """
        Get all host-specific info
        """

        return self.host_info
