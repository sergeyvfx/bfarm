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
import sys
from optparse import OptionParser

# Append libs to search path
abs_file = os.path.abspath(__file__)
cwd = os.path.dirname(abs_file)
sys.path.append(cwd + os.path.sep + 'lib')

import Logger
import Version
from config import Config

# Some default values
role = Config.role

# Parse command line
op = OptionParser()
op.add_option('--role', default=None)
(opts, args) = op.parse_args()

if opts.role is not None:
    if opts.role not in ['master', 'slave']:
        raise Exception('Invalid role specified: {0} ' +
                        '(expected [master|slave])' . format(role))
    else:
        role = opts.role

# Banner
Logger.log('=' * 23, False)
Logger.log(' bfarm version {0} ' . format(Version.bfarm_version), False)
Logger.log('=' * 23, False)
Logger.log('', False)

if role == 'master':
    from master import Master
    master = Master()
    master.run()
else:
    from slave import Slave
    slave = Slave()
    slave.run()
