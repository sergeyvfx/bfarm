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
import signal
import Logger

try:
    # python 3.0 and newer
    import xmlrpc.client

except ImportError:
    import xmlrpclib

    # ssmall hack to make API py3-compatible
    class xmlrpc:
        client = xmlrpclib

    setattr(xmlrpc.client, 'Binary', xmlrpclib.Binary)

from config import Config
from Singleton import Singleton
from LockingServerProxy import LockingServerProxy
from slave.RenderNode import RenderNode


class Slave(Singleton):
    """
    Render farm salve
    """

    def initInstance(self):
        """
        Initialize slave
        """

        self.render_node = RenderNode()

        address = Config.slave['master_address']
        port = Config.slave['master_port']
        url = 'http://{0}:{1}/'.format(address, port)

        self.proxy = LockingServerProxy(url)
        self.proxy_addr = (address, port)

        # Set signal handlers
        self.setSignals()

    def sigint_handler(self, sig, frame):
        """
        Handler of SIGINT signal
        """

        Logger.log('Caught SIGINT signal, terminating...')
        self.render_node.requestStop()
        sys.exit(1)

    def setSignals(self):
        """
        Set signals handlers
        """

        signal.signal(signal.SIGINT,
            lambda sig, frame: self.sigint_handler(sig, frame))

    def run(self):
        """
        Run slave logic
        """

        self.render_node.start()
        self.render_node.join()

    def getRenderNode(self):
        """
        Get node descriptor
        """

        return self.render_node

    def getProxy(self):
        """
        Get XML-RPC proxy
        """

        return self.proxy

    def getProxyAddress(self):
        """
        Get XML-RPC proxy address
        """

        return self.proxy_addr
