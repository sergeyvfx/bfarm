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

import time
import os
import threading
import shutil
import subprocess
import os

from Hash import md5_for_file
from config import Config

import Logger


class RenderJob:
    """
    Render job descriptor
    """

    total_jobs = 0

    TASK_NONE, TASK_RUNNING, TASK_DONE = range(3)

    def __init__(self, options):
        """
        Initialize job descriptor
        """

        self.uuid = str(RenderJob.total_jobs)
        self.time = time.time()

        storage = Config.master['storage_path']
        self.storage_fpath = os.path.join(storage, 'job-' + self.uuid)

        # steup storage directory structure
        self.prepareStorage()

        self.blendRequired = False
        self.blendReceived = False

        self.job_type = options['type']

        if self.job_type == 'anim':
            self.start_frame = options['start-frame']
            self.end_frame = options['end-frame']
        else:
            # XXX: ...
            pass

        self.fname = options.get('fname')
        self.fname_path = None

        # get base and full .blend file name
        if self.fname:
            if self.fname.startswith('file://'):
                self.blend_name = self.fname[7:]
                self.blend_path = os.path.join(self.storage_fpath,
                                               self.blend_name)
                if 'fp' in options:
                    self.saveBlend(options['fp'])
                    self.blendRequired = False
                else:
                    self.blendRequired = True

        self.ntasks = 0
        if self.job_type == 'anim':
            # task for each frame
            self.ntasks = int(options['end-frame']) - \
                int(options['start-frame']) + 1
        else:
            # XXX: need better detection of still parts
            self.ntasks = 9

        self.tasks = [{'status': RenderJob.TASK_NONE} \
                             for x in range(self.ntasks)]

        self.tasks_remain = self.ntasks

        self.task_lock = threading.Lock()

        self.title = options.get('title')
        if self.title is None or self.title == '':
            self.title = 'Untitled'

        self.render_files = []  # List of fully rendered files
        self.render_lock = threading.Lock()

        # Output parameters
        self.file_format = options.get('file_format')
        self.resol_x = options.get('resol_x')
        self.resol_y = options.get('resol_y')
        self.percentage = options.get('percentage')
        self.color_mode = options.get('color_mode')

        self.useStamp = False
        if 'use_stamp' in options and options['use_stamp']:
            self.useStamp = True

        # Time job finish
        self.finish_time = None

        if 'priority' in options:
            self.priority = options['priority']
        else:
            self.priority = 0

        self.task_time_max = None
        self.task_time_avg = None

        # Scheduling ignorance rules
        # used to deal with nodes which restores tasks
        # (mostly happens after troubles, which can't be solved
        # with re-assigning)

        self.sche_ignorence = {}

        RenderJob.total_jobs += 1

    def getUUID(self):
        """
        Get UUID of job
        """

        return self.uuid

    def getTime(self):
        """
        Get time of registration
        """

        return self.time

    def getFinishTime(self):
        """
        Get time of finishing
        """

        return self.finish_time

    def getBlendChunk(self, chunk_nr):
        """
        Get chunk of .blend file
        """

        try:
            statinfo = os.stat(self.blend_path)
        except OSError:
            return None

        offset = chunk_nr * Config.master['chunk_size']

        if offset > statinfo.st_size:
            return None

        with open(self.blend_path, 'rb') as handle:
            if handle is None:
                return None

            handle.seek(offset)
            chunk = handle.read(Config.master['chunk_size'])
            handle.close()

            return chunk

    def getBlendChecksum(self):
        """
        Get checksum for .blend file
        """

        if self.blend_path is None:
            return ''

        return md5_for_file(self.blend_path)

    def _putFileChunk(self, fpath, chunk, chunk_nr):
        """
        Put chunk to specified file
        """

        mode = 'wb'
        if chunk_nr > 0:
            mode = 'ab'

        with open(fpath, mode) as handle:
            if handle is None:
                return False

            handle.seek(0, os.SEEK_END)
            handle.write(chunk)

            return True

    def putBlendChunk(self, chunk, chunk_nr):
        """
        Put chunk of source .blend file
        """

        if chunk_nr == 0:
            Logger.log('Job {0}: begin receiving .blend file {1}' .
                format(self.uuid, self.blend_name))

        with self.task_lock:
            if chunk_nr == -1:
                Logger.log('Job {0}: .blend file {1} fully received' .
                    format(self.uuid, self.blend_name))
                self.blendReceived = True
                return True

        return self._putFileChunk(self.blend_path, chunk, chunk_nr)

    def putRenderChunk(self, fname, chunk, chunk_nr):
        """
        Put chunk of rendered file
        """

        if chunk_nr == 0:
            Logger.log('Job {0}: begin receiving rendered image {1}' .
                format(self.uuid, fname))

        if chunk_nr == -1:
            Logger.log('Job {0}: rendered image {1} fully received' .
                format(self.uuid, fname))

            # Put file to list of full-rendered images
            with self.render_lock:
                self.render_files.append(fname)

            return True

        fpath = os.path.join(self.storage_fpath, 'out', fname)
        return self._putFileChunk(fpath, chunk, chunk_nr)

    def saveBlend(self, fp):
        """
        Save .blend file from stream
        """

        with open(self.blend_path, 'wb') as handle:
            shutil.copyfileobj(fp, handle)

    def _makeDir(self, fpath):
        """
        Setup render output directory
        """

        if not os.path.isdir(fpath):
            try:
                os.mkdir(fpath)
            except:
                raise

    def prepareStorage(self):
        """
        Setup storage directory
        """

        out_fpath = os.path.join(self.storage_fpath, 'out')

        self._makeDir(self.storage_fpath)
        self._makeDir(out_fpath)

    def getStoragePath(self):
        """
        Get path to storage directory
        """

        return self.storage_fpath

    def restartTask(self, task_nr):
        """
        Restart specified task
        """

        with self.task_lock:
            task = self.tasks[task_nr]
            task['status'] = RenderJob.TASK_NONE
            del task['start_time']

    def requestTask(self, node):
        """
        Request task for render node
        """

        if self.priority == -99:
            return None

        with self.task_lock:
            if self.blendRequired and not self.blendReceived:
                # .blend file is needed and hasn't been received yet
                return None

            if self.tasks_remain == 0:
                return None

            for x in range(self.ntasks):
                if self.tasks[x]['status'] == RenderJob.TASK_NONE:
                    # Check if task shouldn't be scheduled to this node
                    if self.sche_ignorence.get(x) is not None:
                        if node.getUUID() in self.sche_ignorence[x]:
                            continue

                    task = self.tasks[x]
                    task['status'] = RenderJob.TASK_RUNNING
                    task['start_time'] = time.time()

                    # Common options
                    options = {'jobUUID': self.uuid,
                               'task': x,
                               'ntasks': self.ntasks,
                               'type': self.job_type,
                               'fname': self.fname,
                               'file_format': self.file_format,
                               'resol_x': self.resol_x,
                               'resol_y': self.resol_y,
                               'percentage': self.percentage,
                               'use_stamp': self.useStamp,
                               'color_mode': self.color_mode}

                    # Job-type specified options
                    if self.job_type == 'anim':
                        options['start-frame'] = self.start_frame
                        options['end-frame'] = self.end_frame
                    else:
                        # XXX: ...
                        pass

                    # To avoid passing None
                    new_options = {}
                    for x in options:
                        if options[x] is not None:
                            new_options[x] = options[x]

                    return new_options

            return None

    def taskComplete(self, task_nr):
        """
        Mark specified task as DONE
        """

        with self.task_lock:
            Logger.log('Job {0}: task {1} completed' .
                format(self.uuid, task_nr))

            task = self.tasks[task_nr]
            task['status'] = RenderJob.TASK_DONE
            task['finish_time'] = time.time()

            task_time = task['finish_time'] - task['start_time']

            # Calculate some statistics
            if self.task_time_max is None or self.task_time_max < task_time:
                self.task_time_max = task_time

            if self.task_time_avg is None:
                self.task_time_avg = task_time
            else:
                n = (self.ntasks - self.tasks_remain)
                s = self.task_time_avg * n + task_time
                self.task_time_avg = s / (n + 1)

            self.tasks_remain -= 1

            if self.tasks_remain == 0:
                self.finish_time = time.time()
                Logger.log('Job {0}: completed' . format(self.uuid))

        return True

    def isCompleted(self):
        """
        Check if job is completed
        """

        return self.tasks_remain == 0

    def getType(self):
        """
        Get type of job
        """

        return self.job_type

    def getFileName(self):
        """
        Get name of fiel to render
        """

        return self.fname

    def getTitle(self):
        """
        Get title for job
        """

        return self.title

    def getRenderFiles(self):
        """
        Get list of fully rendered files
        """

        with self.render_lock:
            result = self.render_files[:]

        return result

    def getFileFormat(self):
        """
        Get format of file in which renders would be saved
        """

        return self.file_format

    def getResolution(self):
        """
        Get resolution of outout images
        """
        return {'x': self.resol_x,
                'y': self.resol_y}

    def getPercentage(self):
        """
        Get percentage of resolution
        """

        return self.percentage

    def getStartFrame(self):
        """
        Get start frame of animation
        """

        if self.job_type == 'anim':
            return self.start_frame

        return None

    def getEndFrame(self):
        """
        Get end frame of animation
        """

        if self.job_type == 'anim':
            return self.end_frame

        return None

    def getTasksCount(self):
        """
        Get total count of tasks
        """

        return self.ntasks

    def getProgress(self):
        """
        Get count of completed tasks
        """

        return self.ntasks - self.tasks_remain

    def getPriority(self):
        """
        Get priority number
        """

        return self.priority

    def setPriority(self, priority):
        """
        Set priority number
        """

        self.priority = priority

    def getThumbnail(self, fname):
        """
        Get thumbnail for frame
        """

        if fname not in self.render_files:
            return None

        out_fpath = os.path.join(self.storage_fpath, 'out')
        thumbs_fpath = os.path.join(self.storage_fpath, 'thumbs')

        thumbname = fname
        if thumbname.find('.'):
            thumbname = fname.split('.')[0] + '.jpg'
        else:
            thumbname = fname + '.jpg'

        self._makeDir(thumbs_fpath)

        thumbs_fpath = os.path.join(thumbs_fpath, thumbname)

        if os.path.isfile(thumbs_fpath):
            # thumbnail is already created
            return thumbs_fpath

        # XXX: Not very cool solution, but there is no image
        #      processing library for python3.1
        fname_path = os.path.join(out_fpath, fname)
        command = ['convert', '-adaptive-resize',
                   Config.master['thumb_size'], fname_path, thumbs_fpath]

        proc = subprocess.Popen(args=command, stdin=subprocess.PIPE,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                shell=False)
        data, err = proc.communicate()
        rv = proc.wait()

        if not os.path.isfile(thumbs_fpath):
            # error creating thumbnail
            return None

        return thumbs_fpath

    def getMaxTaskTime(self):
        """
        Get maximal task time
        """

        return self.task_time_max

    def getAvgTaskTime(self):
        """
        Get average task time
        """

        return self.task_time_avg

    def ignoreNodeForTask(self, node, task_nr):
        """
        Add node to task ignore list
        """

        if self.sche_ignorence.get(task_nr) is None:
            self.sche_ignorence[task_nr] = []

        nodeUUID = node.getUUID()

        Logger.log('Job {0}: task {1} would never be scheduled to node {2}' .
            format(self.uuid, task_nr, nodeUUID))

        self.sche_ignorence[task_nr].append(nodeUUID)
