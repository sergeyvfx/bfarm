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
import os
import sys
import cgi
import io
from tempfile import TemporaryFile

try:
    # Python 3.0 and newer
    import http.server
    import http.client
    import socketserver
    import urllib.parse

except ImportError:
    import BaseHTTPServer
    import httplib
    import SocketServer
    import urllib
    import urlparse

    class parse:
        def splitquery(cls, *args, **kwargs):
            return urllib.splitquery(*args, **kwargs)

        def parse_qs(cls, *args, **kwargs):
            return urlparse.parse_qs(*args, **kwargs)

        def unquote(cls, *args, **kwargs):
            return urllib.unquote(*args, **kwargs)

        splitquery = classmethod(splitquery)
        parse_qs = classmethod(parse_qs)
        unquote = classmethod(unquote)

    setattr(urllib, 'parse', parse)

    # ssmall hack to make API py3-compatible
    class http:
        server = BaseHTTPServer
        client = httplib

    socketserver = SocketServer

import Logger
from SignalThread import SignalThread
from config import Config
from server.HTTPHandlers import FileHandler
from server.HTTPHandlers import AjaxHandler
from server.HTTPHandlers import PackHandler
from server.HTTPActions import RegisterJob
from server.Multipart import parseMultipart
import Version


class HTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    """
    HTTP request handler class
    """

    MEMFILE_MAX = 1024 * 100

    server_version = 'bfarm/{0} webserver at {1}:{2}' . \
        format(Version.bfarm_version, socket.gethostname(),
            Config.server['http_port'])

    _action_handlers = {'registerJob': RegisterJob}

    def __init__(self, *args, **kwargs):
        """
        Initialize HTTP request
        """

        self.content_length = 0
        self.body_fp = None
        self.GET = {}
        self.POST = {}
        self.parts = {}

        http.server.BaseHTTPRequestHandler.__init__(self, *args, **kwargs)

    def do_GET(self):
        """
        Handle GET requests
        """

        self.parse()

        if self.path.startswith('/ajax'):
            AjaxHandler.execute(self)
        elif self.path.startswith('/pack'):
            PackHandler.execute(self)
        else:
            FileHandler.execute(self)

    def do_POST(self):
        """
        Handle POST requests
        """

        self.parse()

        if self.GET.get('action') is not None:
            action = self.GET['action']
            handler = self._action_handlers.get(action)
            if handler is not None:
                proc = getattr(handler, 'execute')
                if proc is not None:
                    proc(self)

        if self.headers.get('Referer') is not None:
            self.send_response(301)
            self.send_header('Location', self.headers['Referer'])
            self.end_headers()

    def parse(self):
        """
        Parse content
        """

        cl = self.headers.get('Content-Length')
        if cl is not None:
            self.content_length = int(cl)
        else:
            self.content_length = 0

        fp = self.body
        qs = urllib.parse.splitquery(self.path)[1]
        GET = urllib.parse.parse_qs(qs or '')
        POST = {}

        if self.command == 'GET':
            pass
        elif self.command == 'POST':
            ctype, pdict = cgi.parse_header(self.headers.get('Content-Type'))

            if ctype == 'multipart/form-data':
                memfile_max = self.MEMFILE_MAX
                self.parts = parseMultipart(fp, pdict,
                                            memfile_max=memfile_max)

                for name in self.parts:
                    if POST.get('name') is not None:
                        continue

                    all_parts = self.parts[name]
                    for x in range(len(all_parts)):
                        part = all_parts[x]

                        if part.get('filename'):
                            continue

                        fp = part['fp']
                        fp.seek(0, os.SEEK_END)
                        size = fp.tell()
                        fp.seek(0)

                        if size > self.MEMFILE_MAX:
                            continue

                        POST[name] = fp.read()
                        try:
                            POST[name] = [str(POST[name].decode())]
                        except UnicodeDecodeError:
                            pass

                        fp.seek(0)

            elif ctype == 'application/x-www-form-urlencoded':
                qs = fp.read()
                POST = urllib.parse.parse_qs(qs or '')

        # Register first parameter argument only in dict
        # multiplie values seems cool, but not usable for our cases
        for key in GET:
            self.GET[key] = GET[key][0]

        for key in POST:
            self.POST[key] = POST[key][0]

    @property
    def body(self):
        if self.body_fp is None:
            maxread = max(0, self.content_length)

            if maxread < self.MEMFILE_MAX:
                body = io.BytesIO()
            else:
                body = TemporaryFile(mode='w+b')

            body = io.BytesIO()
            while maxread > 0:
                nbytes = min(maxread, self.MEMFILE_MAX)
                part = self.rfile.read(nbytes)
                if not part:  # TODO: Wrong content_length. Error? Do nothing?
                    break
                body.write(part)
                maxread -= len(part)
            self.body_fp = body
        self.body_fp.seek(0)
        return self.body_fp

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


class HTTPServer(socketserver.ThreadingMixIn,
                 http.server.HTTPServer, SignalThread):
    """
    HTTP server for web-interface
    """

    def __init__(self, address):
        """
        Initialize stoppable HTTP server for renderfarm
        """

        http.server.HTTPServer.__init__(self, address, HTTPRequestHandler)
        SignalThread.__init__(self, name='HTTPServerThread')

        self.daemon = True

        self.address = address
        self.stop_flag = False

        program_startup = os.path.abspath(os.path.dirname(sys.argv[0]))

        fpath = os.path.join(program_startup, 'web')
        self.site_root = os.path.realpath(fpath)

    def run(self):
        """
        Handle requests until stopped
        """

        Logger.log('Started HTTP server at {0}:{1}' .
            format(self.address[0], self.address[1]))

        while not self.stop_flag:
            self.handle_request()

    def requestStop(self):
        """
        Stop server
        """

        self.stop_flag = True

        self._createDummyRequest()

    def _createDummyRequest(self):
        """
        Create dummy request to self
        """

        url = '{0}:{1}' . format(self.address[0], self.address[1])
        conn = http.client.HTTPConnection(url)
        conn.request('GET', '/index.html')
        r1 = conn.getresponse()

        del r1

    def getSiteRoot(self):
        """
        Get site root directory
        """

        return self.site_root
