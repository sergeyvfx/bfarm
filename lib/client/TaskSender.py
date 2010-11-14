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
# The Original Code is Copyright (C) 2010 by Sergey Sharybin <g.ulairi@gmail.com>
# All rights reserved.
#
# The Original Code is: all of this file.
#
# Contributor(s): none yet.
#
# ***** END GPL LICENSE BLOCK *****
#

import sys, os, socket, threading, time

try:
    # python 3.0 and newer
    import xmlrpc.client

except ImportError:
    import xmlrpclib

    # ssmall hack to make API py3-compatible
    class xmlrpc:
        client = xmlrpclib

    setattr(xmlrpc.client, 'Binary', xmlrpclib.Binary)

import Logger

from config import Config

from SignalThread import SignalThread

class TaskSender(SignalThread):
    """
    Sender of ready tasks to server
    """

    def __init__(self, proxy):
        """
        Initialize sender
        """

        SignalThread.__init__(self, name='TaskSenderThread')

        self.proxy = proxy
        self.tasks = []
        self.stop_flag = False
        self.task_lock = threading.Lock()


    def sendTask(self, task):
        """
        Add task to queue to send to server
        """

        with self.task_lock:
            self.tasks.append(task)

    def doSendTask(self, task):
        """
        Send specified task to server
        """

        try:
            chunk_size = Config.client['chunk_size']
            jobUUID = task.getJobUUID()
            output_fname = task.getOutputPath()

            # XXX: implement correct restoring after socket errors
            for root, dirs, files in os.walk(output_fname):
                for f in files:
                    Logger.log ('Sending file {0} as result of job {1} task {2}' . format(f, task.getJobUUID(), task.getTaskNum()))

                    fname_path = os.path.join(root, f)

                    with open(fname_path, 'rb') as handle:
                        chunk = handle.read(chunk_size)
                        chunk_nr = 0

                        while len(chunk) > 0:
                            enc_chunk = xmlrpc.client.Binary(chunk)
                            self.proxy.job.putRenderChunk(jobUUID, f, enc_chunk, chunk_nr)
                            chunk = handle.read(chunk_size)
                            chunk_nr += 1

                        self.proxy.job.putRenderChunk(jobUUID, f, False, -1)

                    Logger.log ('File {0} sent to job {1} task {2}' . format(f, task.getJobUUID(), task.getTaskNum()))

            self.proxy.job.taskComplete(jobUUID, task.getTaskNum())

        except socket.error as strerror:
            Logger.log('Error sending image to server: {0}'. format (strerror))
        except:
            Logger.log('Unexpected error: {0}' . format(sys.exc_info()[0]))
            raise

    def requestStop(self):
        """
        Stop server
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
