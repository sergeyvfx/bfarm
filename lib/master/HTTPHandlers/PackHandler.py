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

import os
import shutil
import sys
import stat

try:
    # Python 3.0 and newer
    import urllib.parse

except ImportError:
    import urllib

from Singleton import Singleton
from PathUtil import getObjectPath


class _PackHandlers(Singleton):
    """
    Set of PACK handlers
    """

    def _packAllFiles(self, httpRequest, fpath, ext=None, ctype='text/plain'):
        """
        Pack all files and send to client
        """

        site_root = httpRequest.server.getSiteRoot()
        fpath = os.path.join(site_root, fpath[1:])
        content_len = 0

        stamp = None
        for root, dirs, files in os.walk(fpath):
            for f in files:
                if f.endswith(ext):
                    fname = os.path.join(root, f)
                    fs = os.stat(fname)
                    content_len += fs[stat.ST_SIZE]
                    if stamp is None or  fs[stat.ST_MTIME] > stamp:
                        stamp = fs[stat.ST_MTIME]

        stamp_str = httpRequest.date_time_string(stamp)
        if httpRequest.headers.get('if-modified-since') == stamp_str:
            httpRequest.send_response(304, 'Not modified')
            httpRequest.end_headers()
            return

        httpRequest.send_response(200)
        httpRequest.send_header('Content-type', ctype)
        httpRequest.send_header('Last-Modified', stamp_str)
        httpRequest.send_header('Content-Length', content_len)
        httpRequest.end_headers()

        for root, dirs, files in os.walk(fpath):
            for f in files:
                if f.endswith(ext):
                    fname = os.path.join(root, f)
                    with open(fname, 'rb') as handle:
                        shutil.copyfileobj(handle, httpRequest.wfile)

    def getUIdevJS(self, httpRequest):
        """
        Get ui-dev sources packed to one file
        """

        self._packAllFiles(httpRequest, '/extern/ui-dev/src', ext='.js',
                           ctype='text/javascript')

    def getJQueryJS(self, httpRequest):
        """
        Get ui-dev sources packed to one file
        """

        self._packAllFiles(httpRequest, '/extern/jquery', ext='.js',
                           ctype='text/javascript')

    def getUIdevCSS(self, httpRequest):
        """
        Get ui-dev sources packed to one file
        """

        site_root = httpRequest.server.getSiteRoot()
        fpath = os.path.join(site_root, 'extern/ui-dev/')

        stamp = None
        for root, dirs, files in os.walk(fpath):
            for f in files:
                if f.endswith('.css'):
                    fname = os.path.join(root, f)
                    fs = os.stat(fname)
                    if stamp is None or fs[stat.ST_MTIME] > stamp:
                        stamp = fs[stat.ST_MTIME]

        stamp_str = httpRequest.date_time_string(stamp)
        if httpRequest.headers.get('if-modified-since') == stamp_str:
            httpRequest.send_response(304, 'Not modified')
            httpRequest.end_headers()
            return

        httpRequest.send_response(200)
        httpRequest.send_header('Content-type', 'text/css')
        httpRequest.send_header('Last-Modified', stamp_str)

        data = ''
        for root, dirs, files in os.walk(fpath):
            for f in files:
                if f.endswith('.css'):
                    fname = os.path.join(root, f)
                    fname = fname.replace(site_root, '')
                    data += "@import url(\"{0}\");\n" . format(fname)

        httpRequest.send_header('Content-Length', len(data))
        httpRequest.end_headers()
        httpRequest.wfile.write(data.encode())

    def initInstance(self):
        """
        Initialize all ajax handlers
        """

        setattr(self, 'ui-dev.js', self.getUIdevJS)
        setattr(self, 'jquery.js', self.getJQueryJS)
        setattr(self, 'ui-dev.css', self.getUIdevCSS)


def execute(httpRequest):
    """
    Execute pack handler
    """

    path = urllib.parse.splitquery(httpRequest.path)[0]
    path = path.replace('/pack/', '')

    handler = getObjectPath(_PackHandlers(), path)
    if handler is not None:
        handler(httpRequest)
        return

    httpRequest.send_error(505, 'Internal serevr error')
