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
import stat
import time
import shutil
import errno
import sys
import mimetypes
import cgi

try:
    # Python 3.0 and newer
    import http.server
    import http.client
    import urllib.parse

except ImportError:
    import BaseHTTPServer
    import httplib
    import urllib

    # ssmall hack to make API py3-compatible
    class http:
        server = BaseHTTPServer
        client = httplib

    setattr(urllib, 'parse', urllib)

import server
import PathUtil

if not mimetypes.inited:
    mimetypes.init()  # try to read system mime.types

extensions_map = mimetypes.types_map.copy()
extensions_map.update({
    '': 'application/octet-stream',   # Default
    '.py': 'text/plain',
    '.c': 'text/plain',
    '.h': 'text/plain',
    })


def translate_path(path):
    """
    Get file name to get receive
    """

    http_server = server.Server().getHTTPServer()
    site_root = http_server.getSiteRoot()

    path = path.split('?', 1)[0]
    path = path.split('#', 1)[0]
    path = urllib.parse.unquote(path)

    path = os.path.join(site_root, path[1:])

    return os.path.realpath(path)


def guess_type(path):
    """
    Guess the type of a file.
    """

    global extensions_map

    base, ext = os.path.splitext(path)
    if ext in extensions_map:
        return extensions_map[ext]
    ext = ext.lower()
    if ext in extensions_map:
        return extensions_map[ext]
    else:
        return extensions_map['']


def send_file(httpRequest, fname):
    """
    Send file to browser
    """

    try:
        with open(fname, 'rb') as handle:
            ctype = guess_type(fname)
            fs = os.fstat(handle.fileno())
            mtime = httpRequest.date_time_string(fs[stat.ST_MTIME])

            httpRequest.send_response(200)
            httpRequest.send_header('Content-type', ctype)
            httpRequest.send_header('Content-Length', str(fs[stat.ST_SIZE]))
            httpRequest.send_header('Last-Modified', mtime)
            httpRequest.end_headers()

            shutil.copyfileobj(handle, httpRequest.wfile)
    except IOError as e:
        if e.errno == errno.ENOENT:
            httpRequest.send_error(404, 'Not found')
        elif e.errno == errno.EACCES:
            httpRequest.send_error(403, 'Forbidden')
        else:
            httpRequest.send_error(505, 'Internal server error')


def get_icon(fname):
    """
    Get icon for file
    """

    mime = mimetypes.guess_type(fname) [0]

    if mime is None:
        return 'file'

    icon = mime.split('/') [0]

    if icon not in ['image', 'audio', 'video']:
        icon = 'file'

    return icon


def list_directory(httpRequest, path):
    """
    Helper to produce a directory listing (absent index.html)
    """

    try:
        list = os.listdir(path)
    except os.error:
        httpRequest.send_error(403, 'Prermittion denied')
        return None

    http_server = server.Server().getHTTPServer()
    site_root = http_server.getSiteRoot()
    serv = httpRequest.server_version

    list.sort(key=lambda a: a.lower())
    r = []
    displaypath = cgi.escape(urllib.parse.unquote(httpRequest.path))
    r.append('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">')
    r.append("<html>\n<title>Directory listing for {0}</title>\n" .
        format(displaypath))
    r.append("<body>\n<h1>Index of {0}</h1>\n" . format(displaypath))
    r.append("<table><tr><th></th><th>Name</th><th>Last modified</th>" +
             "<th>Size</th></tr><tr><th colspan=\"5\"><hr></th></tr>\n")

    if PathUtil.isPathInside(os.path.dirname(path), site_root):
        parent = os.path.dirname(httpRequest.path[:-1])
        r.append("<tr><td valign=\"top\">" +
                 "<img src=\"/pics/icons/back.gif\" alt=\"[DIR]\"></td>" +
                 "<td><a href=\"{0}\">Parent Directory</a></td>" .
                     format(cgi.escape(parent)) +
                 "<td>&nbsp;</td><td align=\"right\">  - </td></tr>\n")

    for name in list:
        fullname = os.path.join(path, name)
        displayname = linkname = name
        st = os.stat(fullname)
        size = st[stat.ST_SIZE]
        unix_time = st[stat.ST_MTIME]
        mtime = time.strftime("%d-%b-%Y %H:%M", time.localtime(unix_time))
        icon = get_icon(fullname)

        # Append / for directories or @ for symbolic links
        if os.path.isdir(fullname):
            displayname = name + '/'
            linkname = name + '/'
            size = '-'
            icon = 'dir'

        if os.path.islink(fullname):
            displayname = name + '@'
            # Note: a link to a directory displays with @ and links with /

        r.append(('<tr><td><img src="/pics/icons/{0}.gif"></td>' +
                  '<td><a href="{1}">{2}</a></td><td align="right">{3} </td>' +
                  '<td align="right">{4} </td></tr>\n') .
            format(icon, urllib.parse.quote(linkname),
                cgi.escape(displayname), mtime, size))

    r.append("<tr><th colspan=\"5\"><hr></th></tr>\n</table>\n")
    r.append("<address>{0}</address>\n</body>\n</html>\n" . format(serv))
    enc = sys.getfilesystemencoding()
    encoded = ''.join(r).encode(enc)

    httpRequest.send_response(200)
    httpRequest.send_header("Content-type", "text/html; charset=%s" % enc)
    httpRequest.send_header("Content-Length", str(len(encoded)))
    httpRequest.end_headers()

    httpRequest.wfile.write(encoded)


def execute(httpRequest):
    """
    Execute file/directory handler

    File ocntent or directory listing would be send to client
    """

    http_server = server.Server().getHTTPServer()
    site_root = http_server.getSiteRoot()
    path = translate_path(httpRequest.path)

    if not PathUtil.isPathInside(path, site_root):
        httpRequest.send_error(403, 'Forbidden')
        return

    if os.path.isdir(path):
        if not httpRequest.path.endswith('/'):
            # redirect browser - doing basically what apache does
            httpRequest.send_response(301)
            httpRequest.send_header('Location', httpRequest.path + '/')
            httpRequest.end_headers()
            return
        else:
            found = False
            for index in ['index.html', 'index.htm']:
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    found = True
                    break
            if not found:
                list_directory(httpRequest, path)
                return

    send_file(httpRequest, path)
