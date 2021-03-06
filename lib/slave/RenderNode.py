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
import socket
import sys

import Logger

from config import Config
import slave
from SignalThread import SignalThread
from slave.RenderTaskSpawner import spawnNewTask
from slave.TaskSender import TaskSender


class RenderNode(SignalThread):
    """
    Render node implementation
    """

    def __init__(self):
        """
        Initialize render node
        """

        SignalThread.__init__(self, name='RenderNodeThread')

        self.stop_flag = False
        self.uuid = None
        self.currentTask = None
        self.host_info = self.collectHostInfo()

        self.taskSender = TaskSender(self)

    def collectHostInfo(self):
        """
        Collect all host-specific info
        """

        info = {}

        if Config.slave['send_host_info']:
            import platform
            import os

            info['hostname'] = socket.gethostname()
            info['arch'] = platform.architecture()[0]

            cores = 1
            if hasattr(os, 'sysconf'):
                if 'SC_NPROCESSORS_ONLN' in os.sysconf_names:
                    cores = os.sysconf('SC_NPROCESSORS_ONLN')

            info['cores'] = cores
            info['platform'] = ' '.join(os.uname()).strip()
            info['dist'] = ' '.join(platform.dist()).strip()

        return info

    def getUUID(self):
        """
        Get node's UUID
        """

        return self.uuid

    def requestStop(self):
        """
        Stop node
        """

        self.stop_flag = True

    def isStopped(self):
        """
        Check if node shutted down
        """

        return self.stop_flag

    def register(self):
        """
        Register node at master
        """

        if self.uuid is not None:
            return

        proxy = slave.Slave().getProxy()

        try:
            self.uuid = proxy.node.register(self.host_info)
            Logger.log('Registered at master under uuid {0}' .
                format(self.uuid))
        except socket.error as strerror:
            Logger.log('Error registering self: {0}'. format(strerror))
        except:
            Logger.log('Unexpected error: {0}' . format(sys.exc_info()[0]))
            raise

    def unregister(self):
        """
        Unregister node from renderfarm master
        """

        if not self.uuid:
            # Not registered at server -- no need in unregistering
            return

        proxy = slave.Slave().getProxy()

        try:
            proxy.node.unregister(self.uuid)
            self.uuid = None
            Logger.log('Node unregisered')
        except socket.error as strerror:
            Logger.log('Error registering self: {0}'. format(strerror))
        except:
            Logger.log('Unexpected error: {0}' . format(sys.exc_info()[0]))
            raise

    def check(self):
        """
        Check if node still walid
        """

        if self.uuid is None:
            return False

        proxy = slave.Slave().getProxy()

        try:
            return proxy.node.check(self.uuid)
        except socket.error as strerror:
            Logger.log('Error checking self: {0}'. format(strerror))
        except:
            Logger.log('Unexpected error: {0}' . format(sys.exc_info()[0]))
            raise

        return False

    def touch(self):
        """
        Touch master to tell we're still alive
        """

        # Ensure we're registered at serevr
        if not self.check():
            if self.uuid is not None:
                Logger.log('Connection to server lost, registering again...')
                self.uuid = None
            self.register()

        if self.uuid is None:
            # Not registered at server
            return

        proxy = slave.Slave().getProxy()

        try:
            proxy.node.touch(self.uuid)
        except socket.error as strerror:
            Logger.log('Error touching master: {0}'. format(strerror))
        except:
            Logger.log('Unexpected error: {0}' . format(sys.exc_info()[0]))
            raise

    def requestTask(self):
        """
        Request task from master
        """

        if self.currentTask is not None:
            # Already got task
            return

        if not self.uuid:
            # Nowhere to request from
            return

        proxy = slave.Slave().getProxy()

        try:
            options = proxy.job.requestTask(self.uuid)
            if options:
                Logger.log('Got new task {0} for job {1}' .
                    format(options['task'], options['jobUUID']))
                self.currentTask = spawnNewTask(options)
        except socket.error as strerror:
            Logger.log('Error requesting task: {0}'. format(strerror))
        except:
            Logger.log('Unexpected error: {0}' . format(sys.exc_info()[0]))
            raise

    def sendRenderedImage(self):
        """
        Send rendered image to selver
        """

        self.taskSender.sendTask(self.currentTask)

    def restoreTask(self):
        """
        Restart assigned task on master
        """

        jobUUID = self.currentTask.getJobUUID()
        task_nr = self.currentTask.getTaskNum()

        Logger.log('Error occured while rendering task {0} of job {1}' .
            format(task_nr, jobUUID))

        proxy = slave.Slave().getProxy()

        proxy.job.restartTask(self.uuid, jobUUID, task_nr)

    def sendResult(self):
        """
        Send result to master
        """

        if not self.currentTask.hasError():
            self.sendRenderedImage()
        else:
            self.restoreTask()

        self.currentTask = None

    def run(self):
        """
        Main cycle of render node
        """

        Logger.log('Started main render node thread')

        self.taskSender.start()

        last_touch_time = last_request_time = time.time()
        first_time = True

        touch_int = Config.slave['touch_interval']
        req_int = Config.slave['job_request_interval']

        while not self.stop_flag:
            cur_time = time.time()

            if first_time or cur_time - last_touch_time >= touch_int:
                self.touch()
                last_touch_time = cur_time

            if first_time or \
               cur_time - last_request_time >= req_int:
                self.requestTask()
                last_request_time = cur_time

            if self.currentTask is not None:
                if not self.currentTask.isAlive():
                    if not self.currentTask.isFinished():
                        self.currentTask.start()
                    else:
                        self.sendResult()

                        # Request next task just after render finish
                        # it should save a bit of time
                        self.requestTask()
                        last_request_time = cur_time

            first_time = False

            time.sleep(0.2)

        # Wait all tasks to be sent to master
        self.taskSender.requestStop()
        self.taskSender.join()

        # Unregister
        self.unregister()

        Logger.log('Main render node thread was stopped')
