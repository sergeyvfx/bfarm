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

import signal
import Logger

from config import Config
from Singleton import Singleton
from server.RenderServer import RenderServer
from server.HTTPServer import HTTPServer
from server.XMLRPCServer import XMLRPCServer

class Server(Singleton):
    def initInstance(self):
        """
        Initialize server
        """

        # Set signal handlers
        self.setSignals()

        # Create servers
        xmlrpc_address     = (Config.server['address'], Config.server['port'])
        http_address       = (Config.server['http_address'], Config.server['http_port'])

        self.render_server = RenderServer()
        self.xmlrpc_server = XMLRPCServer(xmlrpc_address)
        self.http_server   = HTTPServer(http_address)

    def sigint_handler(self, sig, frame):
        """
        Handler of SIGINT signal
        """

        Logger.log('Caught SIGINT signal, terminating...')

        self.render_server.requestStop()

    def setSignals(self):
        """
        Set signals handlers
        """

        signal.signal(signal.SIGINT, lambda sig, frame: self.sigint_handler(sig, frame))

    def run(self):
        """
        Run server logic
        """

        # Start server threads
        self.render_server.start()
        self.xmlrpc_server.start()
        self.http_server.start()

        # Join main render thread
        self.render_server.join()

        # XML and HTTP servers should be stopped after main render server finito
        self.xmlrpc_server.requestStop()
        self.xmlrpc_server.join()

        self.http_server.requestStop()
        self.http_server.join()

    def getRenderServer(self):
        """
        Get render server instance
        """

        return self.render_server
