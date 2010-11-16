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

# XXX: for debug only
if __name__ == '__main__':
    import os
    import sys

    abs_file = os.path.abspath(__file__)
    cwd = abs_file
    for i in range(2):
        cwd = os.path.dirname(cwd)
    sys.path.append(cwd)
    cwd = os.path.dirname(cwd)
    sys.path.append(cwd)

import client.RenderTask
from client.StillRenderTask import StillRenderTask
from client.AnimRenderTask import AnimRenderTask


def spawnNewTask(options):
    """
    Spawn new task object depending on options
    """

    # quiet silly determination atm, but KISS :)
    if options.get('type') == 'still':
        return StillRenderTask(options)
    else:
        return AnimRenderTask(options)

if __name__ == '__main__':
    options = {'type':  'still',
               'fname': '/home/nazgul/tmp/test.blend'}
    task = spawnNewTask(0, None, options)
    task.run()
