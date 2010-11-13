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

import os, sys

def next_arg(argv, i):
    if i >= len(argv) - 1:
        raise Exception('Unable to parse arguments: missed value for argument {0}' . format(argv[i]))

    return argv[i + 1]

# Append libs to search path
abs_file = os.path.abspath(__file__)
cwd = os.path.dirname(abs_file)
sys.path.append(cwd + os.path.sep + 'lib')

import Logger
from config import Config

# Some default values
role = Config.role

# Parse command line
i = 0
n = len(sys.argv)
while i < n:
    if sys.argv[i] == '--role':
        role = next_arg(sys.argv, i)
        if role not in ['server', 'client']:
            raise Exception('Invalid role specified: {0} (expected [server|client])' . format(role))
    i += 1

# Banner
Logger.log('=' * 23, False)
Logger.log(' bfarm version 0.1pre ', False)
Logger.log('=' * 23, False)
Logger.log('', False)

if role == 'server':
    from server import Server
    server = Server()
    server.run()
else:
    from client import Client
    client = Client()
    client.run()
