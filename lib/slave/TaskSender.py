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

import sys
import os
import socket
import threading
import time

try:
    # python 3.0 and newer
    import xmlrpc.client

except ImportError:
    import xmlrpclib

    # ssmall hack to make API py3-compatible
    class xmlrpc:
        client = xmlrpclib

    setattr(xmlrpc.client, 'Binary', xmlrpclib.Binary)

import slave
import Logger

from config import Config

from SignalThread import SignalThread


class TaskSender(SignalThread):
    """
    Sender of ready tasks to master
    """

    def __init__(self, node):
        """
        Initialize sender
        """

        SignalThread.__init__(self, name='TaskSenderThread')

        self.tasks = []
        self.stop_flag = False
        self.task_lock = threading.Lock()

        self.node = node

    def sendTask(self, task):
        """
        Add task to queue to send to master
        """

        with self.task_lock:
            self.tasks.append(task)

    def doSendTask(self, task):
        """
        Send specified task to master
        """

        proxy = slave.Slave().getProxy()
        chunk_size = Config.slave['chunk_size']
        jobUUID = task.getJobUUID()
        nodeUUID = self.node.getUUID()
        task_nr = task.getTaskNum()
        output_fname = task.getOutputPath()

        for root, dirs, files in os.walk(output_fname):
            for f in files:
                Logger.log('Sending file {0} as result of job {1} task {2}' .
                    format(f, task.getJobUUID(), task.getTaskNum()))

                fname_path = os.path.join(root, f)

                with open(fname_path, 'rb') as handle:
                    chunk = handle.read(chunk_size)
                    chunk_nr = 0
                    enc_chunk = None

                    while len(chunk) > 0:
                        ok = False

                        if enc_chunk is None:
                            enc_chunk = xmlrpc.client.Binary(chunk)

                        try:
                            res = proxy.job.putRenderChunk(nodeUUID,  jobUUID,
                                          task_nr, f, enc_chunk, chunk_nr)
                            ok = True

                        except socket.error as strerror:
                            Logger.log('Error sending image to master: {0}' .
                                format(strerror))

                            time.sleep(0.2)
                        except:
                            Logger.log('Unexpected error: {0}' .
                                format(sys.exc_info()[0]))
                            raise

                        if ok:
                            if res == False:
                                # Chunk was rejected. Happens after network
                                # lags and jobs re-assignment

                                return

                            chunk = handle.read(chunk_size)
                            chunk_nr += 1
                            enc_chunk = None

                    proxy.job.putRenderChunk(nodeUUID, jobUUID, task_nr,
                                             f, False, -1)

                Logger.log('File {0} sent to job {1} task {2}' .
                    format(f, jobUUID, task_nr))

        proxy.job.taskComplete(nodeUUID, jobUUID, task_nr)

    def requestStop(self):
        """
        Stop sender
        """

        self.stop_flag = True

    def run(self):
        """
        Thread body of sending stuff
        """

        while not self.stop_flag:
            task = None
            with self.task_lock:
                if len(self.tasks):
                    task = self.tasks[0]

            if task is not None:
                self.doSendTask(task)

                with self.task_lock:
                    self.tasks.remove(task)
            else:
                time.sleep(0.2)
