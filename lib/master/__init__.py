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

import signal

import Logger

from config import Config
from Singleton import Singleton
from master.RenderServer import RenderServer
from master.HTTPServer import HTTPServer
from master.XMLRPCServer import XMLRPCServer
from master.Mapper import Mapper
from master.LogServer import LogServer


class Master(Singleton):
    """
    BFarm master server
    """

    def initInstance(self):
        """
        Initialize master
        """

        # Set signal handlers
        self.setSignals()

        self.setupLogger()

        # Create servers
        xmlrpc_address = (Config.master['address'], Config.master['port'])
        http_address = (Config.master['http_address'],
                        Config.master['http_port'])

        self.render_server = RenderServer()
        self.xmlrpc_server = XMLRPCServer(xmlrpc_address)
        self.http_server = HTTPServer(http_address)

        # Create ORM mapper
        self.mapper = Mapper(Config.master['database_path'])

        self.unwind(self.mapper)

    def loggerHandler(self, message):
        """
        Handler of new incoming logging message
        """

        self.log_server.logMessage('server', message)

    def setupLogger(self):
        """
        Setup logging infrastructure
        """

        self.log_server = LogServer()
        self.log_server.addSource('server')

        Logger.addLoggerHandler(self.loggerHandler)

    def unwind(self, mapper):
        """
        Unwind all structures stored in database
        """

        self.render_server.unwind(mapper)

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

        signal.signal(signal.SIGINT,
            lambda sig, frame: self.sigint_handler(sig, frame))

    def run(self):
        """
        Run master logic
        """

        # Start server threads
        self.render_server.start()
        self.xmlrpc_server.start()
        self.http_server.start()

        # Join main render thread
        self.render_server.join()

        # XML and HTTP servers should be stopped
        # after main render server finito
        self.xmlrpc_server.requestStop()
        self.xmlrpc_server.join()

        # Do not join HTTP server due to some clients could
        # still be connected (chrome, i.e. locks handle_request)
        # not sure why this happens, but better use
        # daemon thread for web server

        self.http_server.requestStop()
        #self.http_server.join()

        # Flush all posible changes to database
        self.mapper.flush()

    def getRenderServer(self):
        """
        Get render server instance
        """

        return self.render_server

    def getHTTPServer(self):
        """
        Get render server instance
        """

        return self.http_server

    def getMapper(self):
        """
        Get ORM mapper
        """

        return self.mapper

    def getLogServer(self):
        """
        Get logging server
        """

        return self.log_server
