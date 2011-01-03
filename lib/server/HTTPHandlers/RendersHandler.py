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
import shutil
import errno

try:
    # Python 3.0 and newer
    import urllib.parse

except ImportError:
    import urllib

import server
from server.HTTPHandlers.FileHandler import send_listing, guess_type


def jobs_listing(httpRequest):
    """
    Send list of jobs
    """

    render_server = server.Server().getRenderServer()
    jobs = render_server.getJobs()
    completed_jobs = render_server.getCompletedJobs()

    all_jobs = jobs + completed_jobs
    all_jobs.sort(key=lambda a: a.getUUID())

    listing = []
    for job in all_jobs:
        item = {'name': 'job-' + job.getUUID(),
                'is_dir': True,
                'unix_time': job.getTime(),
                'size': 0}

        listing.append(item)

    send_listing(httpRequest, '/renders', listing, '/')


def frames_listing(httpRequest, jobName):
    """
    Send listing of frames
    """

    jobName = jobName[4:]

    render_server = server.Server().getRenderServer()
    job = render_server.getJob(jobName)

    if job is None:
        httpRequest.send_error(404, 'Not found')
        return

    path = os.path.join(job.getStoragePath(), 'out')

    files = job.getRenderFiles()

    files.sort(key=lambda a: a.lower())

    listing = []
    for name in files:
        fullname = os.path.join(path, name)

        if os.path.isfile(fullname):
            st = os.stat(fullname)
            size = st[stat.ST_SIZE]
            unix_time = st[stat.ST_MTIME]
        else:
            size = 0
            unix_time = 0

        item = {'name': name,
                'unix_time': unix_time,
                'size': size}

        listing.append(item)

    send_listing(httpRequest, '/renders/job-' + jobName, listing, '/renders')


def send_frame(httpRequest, jobName, frameName):
    """
    Send pecified frame
    """

    jobName = jobName[4:]

    render_server = server.Server().getRenderServer()
    job = render_server.getJob(jobName)

    if job is None or frameName not in job.getRenderFiles():
        httpRequest.send_error(404, 'Not found')
        return

    if 'thumbnail' in httpRequest.GET:
        fname = job.getThumbnail(frameName)
        if fname is None:
            fname = '/pics/not_avaliable.png'
    else:
        fname = os.path.join(job.getStoragePath(), 'out', frameName)

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


def execute(httpRequest):
    """
    Execute file/directory handler

    File ocntent or directory listing would be send to client
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
    if len(path) <= 2:
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
            jobs_listing(httpRequest)
        elif len(path) == 2:
            ok = True
            jobName = urllib.parse.unquote(path[1])
            frames_listing(httpRequest, jobName)
        elif len(path) == 3:
            ok = True
            jobName = urllib.parse.unquote(path[1])
            frameName = urllib.parse.unquote(path[2])
            send_frame(httpRequest, jobName, frameName)

    if not ok:
        httpRequest.send_error(505, 'Internal serevr error')
