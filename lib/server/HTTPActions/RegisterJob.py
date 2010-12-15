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

import server


def execute(httpRequest):
    """
    Execute job registration action
    """

    output_params = ['file_format', 'resol_x', 'resol_y', 'percentage']

    if httpRequest.POST.get('type') is None:
        return

    render_server = server.Server().getRenderServer()
    job = {'type': httpRequest.POST['type']}

    if httpRequest.POST.get('title'):
        # XXX: string escape would necessery in the future
        job['title'] = httpRequest.POST['title']

    if httpRequest.parts.get('blenfile'):
        part = httpRequest.parts['blenfile'][0]
        filename = part['filename']
        if len(filename):
            fname = 'file://' + os.path.basename(filename)
            job['fname'] = fname
            job['fp'] = part['fp']

    if job['type'] == 'anim':
        job['start-frame'] = int(httpRequest.POST['start-frame'])
        job['end-frame'] = int(httpRequest.POST['end-frame'])

    for x in output_params:
        if httpRequest.POST.get(x) is not None:
            val = httpRequest.POST[x]

            if x != 'file_format':  # XXX: hacky..
                val = int(val)

            job[x] = val

    # XXX: implement better checking and error reporting
    if job.get('fname') is None:
        return

    render_server.registerJob(job)
