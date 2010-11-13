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

import sys, subprocess, os

import Logger
from config import Config
from SignalThread import SignalThread

from client.EnvironSpawner import spawnNewEnviron

class RenderTask(SignalThread):
    """
    Render task implementation
    """

    def __init__(self, node, options):
        """
        Initialize task
        """

        SignalThread.__init__(self, name = 'RenderTaskThread')

        self.jobUUID  = options['jobUUID']
        self.task     = options['task']
        self.node     = node
        self.options  = options

        # Runtime calculated fields
        self.fpath        = None
        self.output_fpath = None
        self.pipe         = None

        self.finishFlag = False

        self.environ = spawnNewEnviron(self.node, options)

    def prepareEnv(self):
        """
        Prepare environment before start rendering
        """

        self.environ.prepare(self.options)
        self.fpath = self.environ.getBlend()
        self.output_fpath = self.environ.getOutput()

    def getBlenderBinary(self):
        """
        Get arguments to pass to blender binary
        """

        return Config.client['blender-binary']

    def getBlenderArguments(self):
        """
        Get arguments to pass to blender binary
        """

        # Get absolute path to blender setup script
        program_startup = os.path.abspath(os.path.dirname(sys.argv[0]))
        blender_setup = os.path.join(program_startup, 'lib', 'blender_setup.py')

        args = []

        # File to be rendered
        args.append('--background')
        args.append(self.fpath)

        # Configuration script
        args.append('--python')
        args.append(blender_setup)

        # No more blender-related arguments
        args.append('--')

        args.append('--node-id')
        args.append(self.node.uuid)

        args.append('--task-id')
        args.append(str(self.task))

        args.append('--output-path')
        args.append(self.output_fpath)

        # XXX: for debug only
        args.append('--use-stamp')

        # For correct node IP detection (for stamp)
        args.append('--server-addr')
        args.append(self.node.proxy_addr[0] + ':' + str(self.node.proxy_addr[1]))

        return args

    def getBlenderCommand(self):
        """
        Get blender execute command
        """

        binary = self.getBlenderBinary()
        args = self.getBlenderArguments()

        return [binary] + args

    def runBlender(self):
        """
        Run blender process
        """

        Logger.log('Blender started rendering task {0} of job {1}' . format(self.task, self.jobUUID))

        command = self.getBlenderCommand()

        proc = subprocess.Popen(args = command, stdin = subprocess.PIPE, stdout = subprocess.PIPE,
                                stderr = subprocess.PIPE, shell = False)
        data, err = proc.communicate()
        rv = proc.wait()

        Logger.log('Blender finished work with errcode {0}' . format(rv))

        self.pipe = {'stdout'   : data.decode(),
                     'stderr'   : err.decode(),
                     'exitcode' : rv}

        if len(self.pipe['stderr']) > 0:
            Logger.log("Error from Blender:\n{0}" . format(self.pipe['stderr']))

        return rv

    def isFinished(self):
        """
        Check if thread finished it's work
        """

        if self.isAlive():
            return False

        return self.finishFlag

    def run(self):
        """
        Run task
        """

        self.finishFlag = False

        try:
            self.prepareEnv()
            self.runBlender()
        finally:
            self.finishFlag = True

    def getOutputPath(self):
        """
        Get output directory path
        """

        return self.output_fpath

    def getJobUUID(self):
        """
        Get UUID of job
        """

        return self.jobUUID

    def getTaskNum(self):
        """
        Get tasj number
        """

        return self.task
