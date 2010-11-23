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


import json

try:
    # Python 3.0 and newer
    import urllib.parse

except ImportError:
    import urllib

import server
from Singleton import Singleton


def _send_json(httpRequest, obj):
    """
    Send object encoded with JSON
    """

    respond = json.dumps(obj).encode()

    httpRequest.send_response(200)
    httpRequest.send_header("Content-type", "text/plain")
    httpRequest.send_header("Content-Length", respond)
    httpRequest.end_headers()

    httpRequest.wfile.write(respond)


class _Ajaxhandlers(Singleton):
    """
    Set of AJAX handlers
    """

    class Get:
        """
        Ajax getters
        """

        def nodes(self, httpRequest):
            """
            Get list of all nodes
            """

            render_server = server.Server().getRenderServer()

            nodes = render_server.getNodes()
            enc = []
            for node in nodes:
                enc.append({'uuid': node.getUUID(),
                            'enabled': node.isEnabled(),
                            'ip': node.getIP()})

            _send_json(httpRequest, enc)

        def jobs(self, httpRequest):
            """
            Get list of all jobs
            """

            render_server = server.Server().getRenderServer()

            jobs = render_server.getJobs()
            enc = []
            for job in jobs:
                enc.append({'uuid': job.getUUID(),
                            'type': job.getType(),
                            'fname': job.getFileName(),
                            'title': job.getTitle()})

            _send_json(httpRequest, enc)

    def initInstance(self):
        """
        Initialize all ajax handlers
        """

        self.get = _Ajaxhandlers.Get()


def translate_path(obj, path):
    """
    Translate path and return handler
    """

    if len(path) == 0:
        return obj

    i = path.find('/')
    rest = ''
    if i >= 0:
        field = path[:i]
        rest = path[i + 1:]
    else:
        field = path

    if field.startswith('_'):
        return None

    try:
        nobj = getattr(obj, field)
    except AttributeError:
        return None

    if nobj is not None:
        return translate_path(nobj, rest)

    return None


def execute(httpRequest):
    """
    Execute file/directory handler

    File ocntent or directory listing would be send to client
    """

    path = urllib.parse.splitquery(httpRequest.path)[0]
    path = path.replace('/ajax/', '')

    handler = translate_path(_Ajaxhandlers(), path)
    if handler is not None:
        handler(httpRequest)
        return

    httpRequest.send_error(505, 'Internal serevr error')
