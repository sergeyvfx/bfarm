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

import Logger
import master

from time import sleep
from config import Config
from SignalThread import SignalThread

from master.RenderNode import RenderNode
from master.RenderJob import RenderJob


class RenderServer(SignalThread):
    """
    Renderfarm server
    """

    def __init__(self):
        """
        Initialize render server
        """

        SignalThread.__init__(self, name='RenderServerThread')

        self.daemon = True
        self.stop_flag = False

        self.jobs_lock = threading.Lock()
        self.nodes_lock = threading.Lock()

        # Store both of list and dict to be able:
        #   1. Review nodes/jobs in order they were registered
        #   2. Get plain lists fast for web-unterface
        #   3. Fast accessing by UUID
        #   4. Use priorited jobs
        #
        # Fill free to use something smarter ;)
        self.nodes = []
        self.nodes_hash = {}

        self.jobs = []
        self.jobs_hash = {}

        # list of fully completed jobs
        self.completed_jobs = []

        self.prepareStorage()

    def getMapper(self):
        """
        Get ORM mapper -- utility function
        """

        return master.Master().getMapper()

    def requestStop(self):
        """
        Stop server
        """

        self.stop_flag = True

    def isStopped(self):
        """
        Check if server shutted down
        """

        return self.stop_flag

    #
    # Render nodes
    #

    def getNodes(self):
        """
        Get list of nodes
        """

        # XXX: could be a bit optimized?
        with self.nodes_lock:
            nodes = self.nodes[:]

        return nodes

    def getNode(self, uuid):
        """
        Get node by it's UUID
        """

        with self.nodes_lock:
            node = self.nodes_hash.get(uuid)

        return node

    def registerNode(self, hostname, client_info):
        """
        Register new node
        """

        node = RenderNode(hostname, client_info)

        with self.nodes_lock:
            self.nodes.append(node)
            self.nodes_hash[node.getUUID()] = node

        Logger.log('Registered new render node {0} at {1}' . \
                format(node.getUUID(), node.getIP()))

        return node.getUUID()

    def unregisterNode(self, node):
        """
        Unregister render node
        """

        with self.jobs_lock:
            tasks = node.getTasks()
            for task in tasks:
                job = self.jobs_hash.get(task['jobUUID'])
                task_nr = task['task_nr']
                Logger.log('Restart task {0} of job {1}' .
                    format(task_nr, job.getUUID()))
                job.restartTask(task_nr)

        with self.nodes_lock:
            self.nodes.remove(node)
            del self.nodes_hash[node.getUUID()]

        Logger.log('Node {0} unregistered'.format(node.getUUID()))

        return True

    def touchNode(self, node):
        """
        Touch render node
        """

        node.touch()

        return True

    def reviewNodes(self):
        """
        Review all render nodes
        """

        # make copy of nodes list to be thread-safe here
        nodes = self.getNodes()

        for node in nodes:
            if not node.isAlive():
                Logger.log('Node {0} became zombie - unregister' .
                    format(node.getUUID()))
                self.unregisterNode(node)

    #
    # Render jobs
    #

    def getJobs(self):
        """
        Get list of all running jobs
        """

        with self.jobs_lock:
            jobs = self.jobs[:]

        return jobs

    def getCompletedJobs(self):
        """
        Get list of all completed jobs
        """

        with self.jobs_lock:
            jobs = self.completed_jobs[:]

        return jobs

    def getJob(self, jobUUID):
        """
        Get job by it's UUID
        """

        with self.jobs_lock:
            job = self.jobs_hash.get(jobUUID)

        return job

    def registerJob(self, options):
        """
        Register new job to render
        """

        job = RenderJob(options)

        # Register new job in ORM
        self.getMapper().addObject(job)

        with self.jobs_lock:
            self.jobs.append(job)
            self.jobs_hash[job.getUUID()] = job

            self._reorderJobs_Unsafe()

        Logger.log('Registered new render job {0}' . format(job.getUUID()))

        return job.getUUID()

    def unregisterJob(self, job):
        """
        Unregister job
        """

        with self.jobs_lock:
            # XXX: what to do with nodes
            #      which are still rendering tasks from this job?
            self.jobs.remove(job)
            del self.jobs_hash[job.getUUID()]

        Logger.log('Job {0} unregistered'.format(job.getUUID()))

        return True

    def requestTask(self, node):
        """
        Request job for node
        """

        if not node.isEnabled():
            return False

        with self.jobs_lock:
            for job in self.jobs:
                uuid = job.getUUID()
                task = job.requestTask(node)

                if task is not None:
                    task_nr = task['task']
                    node.assignTask(job.getUUID(), task_nr)

                    self.getMapper().updateObject(job)

                    Logger.log('Job {0}: task {1} assigned to node {2}' .
                        format(uuid, task['task'], node.getUUID()))

                    return task

        return False

    def taskComplete(self, job, task_nr):
        """
        Mark render task as DONE
        """

        if job.taskComplete(task_nr):
            if job.isCompleted():
                with self.jobs_lock:
                    self.jobs.remove(job)
                    self.completed_jobs.append(job)

            self.getMapper().updateObject(job)

            return True
        else:
            return False

    def prepareStorage(self):
        """
        Prepare common storage directory structure
        """

        fpath = Config.master['storage_path']

        if not os.path.isdir(fpath):
            try:
                os.mkdir(fpath)
            except:
                raise

    def _reorderJobs_Unsafe(self):
        """
        Reorder jobs for optimal task requesting (for internal use only)
        """

        self.jobs.sort(key=lambda a: 32768 - a.getPriority())

    def reorderJobs(self):
        """
        Reorder jobs for optimal task requesting
        """

        with self.jobs_lock:
            self._reorderJobs_Unsafe()

    def run(self):
        """
        Run server
        """

        Logger.log('Started main renderfarm thread')

        last_review_time = time.time()
        review_int = Config.master['review_nodes_timeout']

        while not self.stop_flag:
            cur_time = time.time()

            if cur_time - last_review_time > review_int:
                self.reviewNodes()
                last_review_time = cur_time

            sleep(0.2)

        Logger.log('Main renderfarm thread was stopped')

    def unwind(self, mapper):
        """
        Unwind all structures stored in database
        """

        jobs = mapper.getAllObjects(RenderJob)

        for job in jobs:
            uuid = job.getUUID()

            job.unwind(mapper)

            if not job.isCompleted():
                self.jobs.append(job)

                Logger.log(('Restored active job {0} ({1} of {2} ' +
                            'tasks completed)') . \
                                format(uuid,
                                       job.getProgress(),
                                       job.getTasksCount()))
            else:
                self.completed_jobs.append(job)

                Logger.log('Restored completed job ' + uuid)

            self.jobs_hash[uuid] = job
