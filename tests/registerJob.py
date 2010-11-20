#!/usr/bin/python
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

# For python2.5 compatibility
from __future__ import with_statement

import sys
import os

try:
    # python 3.0 and newer
    import xmlrpc.client

except ImportError:
    import xmlrpclib

    # small hack to make API py3-compatible
    class xmlrpc:
        client = xmlrpclib

    setattr(xmlrpc.client, 'Binary', xmlrpclib.Binary)

url = 'http://localhost:4043/'
proxy = xmlrpc.client.ServerProxy(url)
uuid = proxy.job.register({'fname':       'file://test.blend',
                           'type':        'anim',
                           'start-frame': 3,
                           'end-frame':   5,
                           'title':       'Job for testing'})

with open('test.blend', 'rb') as handle:
    if handle is not None:
        chunk_size = 32768
        chunk_nr = 0
        chunk = handle.read(chunk_size)

        while len(chunk):
            chunk_enc = xmlrpc.client.Binary(chunk)
            proxy.job.putBlendChunk(uuid, chunk_enc, chunk_nr)
            chunk = handle.read(chunk_size)
            chunk_nr += 1

        proxy.job.putBlendChunk(uuid, False, -1)
