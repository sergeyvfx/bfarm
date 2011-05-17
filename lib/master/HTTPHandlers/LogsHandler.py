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

try:
    # Python 3.0 and newer
    import urllib.parse

except ImportError:
    import urllib

import master
from master.HTTPHandlers.FileHandler import send_listing, guess_type


def logs_listing(httpRequest):
    """
    Send list of jobs
    """

    log_server = master.Master().getLogServer()

    all_sources = log_server.getSources()
    all_sources.sort(key=lambda x: x['name'])

    listing = []
    for source in all_sources:
        item = {'name': source['name'] + '.txt',
                'is_dir': False,
                'unix_time': source['time'],
                'size': source['size']}

        listing.append(item)

    send_listing(httpRequest, '/logs', listing, '/')


def send_log(httpRequest, source):
    """
    Send pecified frame
    """

    source = source[:-4]

    log_server = master.Master().getLogServer()

    if not log_server.hasSource(source):
        httpRequest.send_error(404, 'Not found')
        return

    source = log_server.getSource(source)
    mtime = httpRequest.date_time_string(source['time'])

    if httpRequest.headers.get('if-modified-since') == mtime:
        httpRequest.send_response(304, 'Not modified')
        httpRequest.end_headers()
    else:
        httpRequest.send_response(200)
        httpRequest.send_header('Content-type', 'text/plain')
        httpRequest.send_header('Content-Length', str(source['size']))
        httpRequest.send_header('Last-Modified', mtime)
        httpRequest.end_headers()

        httpRequest.wfile.write(source['buffer'].encode())


def execute(httpRequest):
    """
    Execute logs handler
    """

    url = urllib.parse.splitquery(httpRequest.path)

    path = url[0]
    path = path[1:].split('/')

    try:
        path.remove('')
    except ValueError:
        # path is not end with /, no error at all
        pass

    ok = False
    if len(path) == 1:
        if not url[0].endswith('/'):
            ok = True
            httpRequest.send_response(301)

            suffix = ''
            if url[1] is not None:
                suffix = url[1]

            httpRequest.send_header('Location', url[0] + '/' + suffix)
            httpRequest.end_headers()

    if not ok:
        if len(path) == 1:
            ok = True
            logs_listing(httpRequest)
        elif len(path) == 2:
            ok = True
            send_log(httpRequest, path[1])

    if not ok:
        httpRequest.send_error(505, 'Internal serevr error')
