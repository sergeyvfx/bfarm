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

import socket, time

try:
    # Python 3.0 and newer
    import http.server
    import http.client

except ImportError:
    import BaseHTTPServer
    import httplib

    # ssmall hack to make API py3-compatible
    class http:
        server = BaseHTTPServer
        client = httplib

import Logger
from SignalThread import SignalThread
from config import Config

class HTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    """
    HTTP request handler class
    """

    def do_GET(self):
        """
        Handle GET requests
        """

        # XXX: just for now
        self.send_error(500, 'Internal server error')

    def do_POST(self):
        """
        Handle POST requests
        """

        # XXX: just for now
        self.send_error(500, 'Internal server error')

    def log_request(self, *args):
        """
        Silent logging
        """

        pass

    def log_error(self, *args):
        """
        Silent logging
        """

        pass

class HTTPServer(http.server.HTTPServer, SignalThread):
    """
    HTTP server for web-interface
    """

    def __init__(self, address):
        """
        Initialize stoppable HTTP server for renderfarm
        """

        http.server.HTTPServer.__init__(self, address, HTTPRequestHandler)
        SignalThread.__init__(self, name = 'HTTPServerThread')

        self.daemon    = True
        self.address   = address
        self.stop_flag = False

    def run(self):
        """
        Handle requests until stopped
        """

        Logger.log('Started HTTP server at {0}:{1}' . format(self.address[0], self.address[1]))

        while not self.stop_flag:
            self.handle_request()

    def requestStop(self):
        """
        Stop server
        """

        self.stop_flag = True

        # Actually, server would be stopped after next request handle
        # so create one to prevent locking

        self._createDummyRequest()

    def _createDummyRequest(self):
        """
        Create dummy request to self
        """

        url = '{0}:{1}' . format(self.address[0], self.address[1])
        conn = http.client.HTTPConnection(url)
        conn.request('GET', '/index.html')
        r1 = conn.getresponse()
