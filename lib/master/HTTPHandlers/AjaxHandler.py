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


import json

try:
    # Python 3.0 and newer
    import urllib.parse

except ImportError:
    import urllib

import master
from Singleton import Singleton
from PathUtil import getObjectPath


def _send_json(httpRequest, obj):
    """
    Send object encoded with JSON
    """

    respond = json.dumps(obj).encode()

    httpRequest.send_response(200)
    httpRequest.send_header("Content-type", "text/plain")
    httpRequest.send_header("Content-Length", len(respond))
    httpRequest.end_headers()

    httpRequest.wfile.write(respond)


class _Ajaxhandlers(Singleton):
    """
    Set of AJAX handlers
    """

    class Get:
        """
        Ajax getters
        """

        def nodes(self, httpRequest):
            """
            Get list of all nodes
            """

            render_server = master.Master().getRenderServer()

            nodes = render_server.getNodes()
            enc = []
            for node in nodes:
                enc.append({'uuid': node.getUUID(),
                            'enabled': node.isEnabled(),
                            'ip': node.getIP()})

            _send_json(httpRequest, enc)

        def _send_jobs(self, httpRequest, jobs):
            """
            Send list of specified jobs
            """

            enc = []
            for job in jobs:
                resol = job.getResolution()

                tmp = {'uuid': job.getUUID(),
                       'type': job.getType(),
                       'fname': job.getFileName(),
                       'title': job.getTitle(),
                       'file_format': job.getFileFormat(),
                       'resol_x': resol['x'],
                       'resol_y': resol['y'],
                       'percentage': job.getPercentage(),
                       'start_frame': job.getStartFrame(),
                       'end_frame': job.getEndFrame(),
                       'time': job.getTime(),
                       'finish_time': job.getFinishTime(),
                       'progress': job.getProgress(),
                       'ntasks': job.getTasksCount(),
                       'priority': job.getPriority(),
                       'task_time_max': job.getMaxTaskTime(),
                       'task_time_avg': job.getAvgTaskTime()}

                renderFiles = job.getRenderFiles()
                if renderFiles:
                    tmp['last_frame'] = renderFiles[-1]

                # Allow only non-none data transfer
                obj = {}
                for x in tmp:
                    if tmp[x] is not None:
                        obj[x] = tmp[x]

                enc.append(obj)

            _send_json(httpRequest, enc)

        def runningJobs(self, httpRequest):
            """
            Get list of all running jobs
            """

            render_server = master.Master().getRenderServer()
            jobs = render_server.getJobs()
            self._send_jobs(httpRequest, jobs)

        def completedJobs(self, httpRequest):
            """
            Get list of all completed jobs
            """

            render_server = master.Master().getRenderServer()
            jobs = render_server.getCompletedJobs()
            self._send_jobs(httpRequest, jobs)

        def jobs(self, httpRequest):
            """
            Get list of all (runnign and completed) jobs
            """

            render_server = master.Master().getRenderServer()
            jobs = render_server.getJobs()
            jobs += render_server.getCompletedJobs()

            jobs.sort(key=lambda a: a.getUUID())

            self._send_jobs(httpRequest, jobs)

    class Set:
        def jobPriority(self, httpRequest):
            """
            Set job's priority
            """

            try:
                jobUUID = httpRequest.GET['jobUUID']
                priority = int(httpRequest.GET['priority'])
            except:
                _send_json(httpRequest, {'result': 'fail'})
                return

            render_server = master.Master().getRenderServer()
            job = render_server.getJob(jobUUID)

            answer = {'result': 'ok'}
            if job is None:
                answer['result'] = 'fail'
            else:
                job.setPriority(priority)
                render_server.reorderJobs()

            _send_json(httpRequest, answer)

    def initInstance(self):
        """
        Initialize all ajax handlers
        """

        self.get = _Ajaxhandlers.Get()
        self.set = _Ajaxhandlers.Set()


def execute(httpRequest):
    """
    Execute file/directory handler

    File ocntent or directory listing would be send to client
    """

    path = urllib.parse.splitquery(httpRequest.path)[0]
    path = path.replace('/ajax/', '')

    handler = getObjectPath(_Ajaxhandlers(), path)
    if handler is not None:
        if hasattr(handler, '__call__'):
            handler(httpRequest)
            return

    httpRequest.send_error(505, 'Internal serevr error')
