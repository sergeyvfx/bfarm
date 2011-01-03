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
    import urllib.parse

except ImportError:
    import urllib

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

    path = urllib.parse.splitquery(path)[0]
    path = urllib.parse.unquote(path)

    path = os.path.join(site_root, path[1:])

    return os.path.realpath(path)


def guess_type(path):
    """
    Guess the type of a file.
    """

    global extensions_map

    ext = os.path.splitext(path) [1]
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

            if httpRequest.headers.get('if-modified-since') == mtime:
                httpRequest.send_response(304, 'Not modified')
                httpRequest.end_headers()
            else:
                content_len = str(fs[stat.ST_SIZE])
                httpRequest.send_response(200)
                httpRequest.send_header('Content-type', ctype)
                httpRequest.send_header('Content-Length', content_len)
                httpRequest.send_header('Last-Modified', mtime)
                httpRequest.end_headers()

            shutil.copyfileobj(handle, httpRequest.wfile)
    except IOError as e:
        if e.errno == errno.ENOENT:
            httpRequest.send_error(404, 'Not found')
        elif e.errno == errno.EACCES:
            httpRequest.send_error(403, 'Forbidden')
        elif e.errno == errno.EPIPE:
            # pipe was closed by client, what could we do?
            pass
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


def send_listing(httpRequest, path, listing, parent=None):
    """
    Send prepared listing to client
    """

    serv = httpRequest.server_version

    r = []

    displaypath = cgi.escape(path)
    r.append('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"' +
             ' "http://www.w3.org/TR/html4/strict.dtd">')
    r.append("\n<html>\n<head>\n<title>Directory listing for {0}</title>\n" .
        format(displaypath))
    r.append("<link rel=\"stylesheet\" type=\"text/css\" " +
             "href=\"/styles/listing.css\">\n")
    r.append("</head>\n<body>\n<h2>Index of {0}</h2>\n" . format(displaypath))
    r.append("<div class=\"list\"><table><tr><th width=\"16\"></th>" +
             "<th>Name</th><th>Last modified</th><th>Size</th></tr>\n")

    if parent is not None:
        r.append("<tr><td valign=\"top\">" +
                 "<img src=\"/pics/icons/back.gif\" alt=\"[DIR]\"></td>" +
                 "<td><a href=\"{0}\">Parent Directory</a></td>" .
                     format(cgi.escape(parent)) +
                 "<td>&nbsp;</td><td align=\"right\">  - </td></tr>\n")

    for item in listing:
        name = item['name']
        fullname = path + '/' + item['name']
        displayname = linkname = item['name']
        localtime = time.localtime(item['unix_time'])
        mtime = time.strftime("%d-%b-%Y %H:%M", localtime)
        icon = get_icon(fullname)
        size = item['size']

        # Append / for directories or @ for symbolic links
        if item.get('is_dir'):
            displayname = name + '/'
            linkname = name + '/'
            size = '-'
            icon = 'dir'

        if item.get('is_link'):
            # Note: a link to a directory displays with @ and links with /
            displayname = name + '@'

        r.append(('<tr><td><img src="/pics/icons/{0}.gif"></td>' +
                  '<td><a href="{1}">{2}</a></td><td align="right">{3} </td>' +
                  '<td align="right">{4} </td></tr>\n') .
            format(icon, urllib.parse.quote(linkname),
                cgi.escape(displayname), mtime, size))

    r.append("</table></div>\n" +
             "<div class=\"footer\">{0}</div>\n</body>\n</html>\n" .
             format(serv))
    enc = sys.getfilesystemencoding()
    encoded = ''.join(r).encode(enc)

    httpRequest.send_response(200)
    httpRequest.send_header("Content-type", "text/html; charset=%s" % enc)
    httpRequest.send_header("Content-Length", str(len(encoded)))
    httpRequest.end_headers()

    httpRequest.wfile.write(encoded)


def list_directory(httpRequest, path):
    """
    Helper to produce a directory listing (absent index.html)
    """

    try:
        list = os.listdir(path)
    except os.error:
        httpRequest.send_error(403, 'Prermittion denied')
        return None

    serv = httpRequest.server_version

    list.sort(key=lambda a: a.lower())
    r = []

    prefix = urllib.parse.splitquery(httpRequest.path)[0]
    parent = os.path.dirname(prefix[:-1])
    if parent == '':
        parent = None

    listing = []
    for name in list:
        fullname = os.path.join(path, name)

        st = os.stat(fullname)

        item = {'name': name,
                'unix_time': st[stat.ST_MTIME],
                'size': st[stat.ST_SIZE],
                'is_dir': os.path.isdir(fullname),
                'is_link': os.path.islink(fullname)}

        listing.append(item)

    displaypath = urllib.parse.unquote(prefix)
    send_listing(httpRequest, displaypath, listing, parent)


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
        prefix = httpRequest.path.split('?', 1)[0]
        prefix = prefix.split('#', 1)[0]

        if not prefix.endswith('/'):
            suffix = urllib.parse.splitquery(httpRequest.path)[1]
            if suffix is not None:
                suffix = '?' + suffix
            else:
                suffix = ''

            # redirect browser - doing basically what apache does
            httpRequest.send_response(301)
            httpRequest.send_header('Location', prefix + '/' + suffix)
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
