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


class LogSender(SignalThread):
    """
    Sender of ready tasks to master
    """

    def __init__(self, node):
        """
        Initialize sender
        """

        SignalThread.__init__(self, name='LogSenderThread')

        self.buffer = ''
        self.buffer_lock = threading.Lock()
        self.stop_flag = False

        self.node = node

    def logMessage(self, message):
        """
        Add message to queue to send to master
        """

        with self.buffer_lock:
            self.buffer += message

    def sendMessages(self):
        """
        Send specified task to master
        """

        proxy = slave.Slave().getProxy()
        nodeUUID = self.node.getUUID()

        if self.buffer and nodeUUID is not None:
            if proxy.node.logMessage(nodeUUID, self.buffer):
                self.buffer = ''

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
            self.sendMessages()
            time.sleep(0.7)
