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


class Config:
    role = 'server'

    server = {'address':              '0.0.0.0',
              'port':                 4043,

              'http_address':         '0.0.0.0',
              'http_port':            8080,

              'storage_path':         'storage',

              'chunk_size':           32768,

              'review_nodes_timeout': 30,
              'client_max_age':       90}

    client = {'server_address':       '127.0.0.1',
              'server_port':          4043,
              'job_request_interval': 5,
              'blender-binary':       '/home/nazgul/lib/blender2.5/blender',
              'touch_interval':       5,
              'storage_path':         'storage',
              'chunk_size':           32768}
