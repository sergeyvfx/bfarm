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
import subprocess

from config import Config
import Logger
import slave

from slave.Environ import Environ


class VCSEnviron(Environ):
    """
    Environment for VCS-based source rendering
    """

    vcs_id = ''  # Identifier of VCS in URL
    fname_sep = ''  # Separator of repo name/file name
    commit_sep = ''  # Separator of file name/commit id (revision)

    def __init__(self, options):
        """
        Initialize environment
        """

        Environ.__init__(self, options)

        prefix = self.vcs_id + '//'

        s = options['fname'][len(prefix) + 1:].split(self.fname_sep)
        self.repo = self.trimRepo(self.fname_sep.join(s[:-1]))

        s = s[-1].split(self.commit_sep)
        self.fname = self.commit_sep.join(s[:-1])
        self.commit = s[-1]

        self.encoded_repo = self.encodePath(self.repo)
        self.storage = Config.slave['storage_path']

    def trimRepo(self, repo):
        """
        Trim unaffected prefix/suffix from repo name
        """

        while repo[-1] == '/':
            repo = repo[:-1]

        return repo

    def encodePath(self, path):
        """
        Encode path to be safty used as file/directory name
        """

        return path.replace('/', '_').replace('\\', '_')

    def getRepoPath(self):
        """
        Get full path to cloned repo
        """

        return os.path.join(self.storage, self.encoded_repo)

    def getCloneCmd(self):
        """
        Get command to clone repo
        """

        raise Exception('Should be overwritten')

    def getUpdateCmd(self):
        """
        Get command to update repo
        """

        raise Exception('Should be overwritten')

    def executeCommand(self, command):
        """
        Execute specified command
        """

        try:
            proc = subprocess.Popen(args=command,
                                    stdin=subprocess.PIPE,
                                    stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE,
                                    shell=False)
            data, err = proc.communicate()
            rv = proc.wait()

            stderr = err.decode()

            if len(stderr):
                Logger.log("Error from {0}:\n{1}" .
                    format(self.vcs_id, stderr))
            elif rv != 0:
                Logger.log('Error running {0} (command: {1})' .
                            format(self.vcs_id, command))

            return rv
        except OSError as e:
            Logger.log('Error while running {0} (command: {1}): {2}' .
                        format(self.vcs_id, command, e))

            return -1

    def cloneRepo(self):
        """
        Clone repo to specified location
        """

        repo_path = self.getRepoPath()
        cmd = self.getCloneCmd()

        return self.executeCommand(cmd) == 0

    def updateRepo(self):
        """
        Update repo to specified location
        """

        repo_path = self.getRepoPath()
        cmd = self.getUpdateCmd()

        return self.executeCommand(cmd) == 0

    def prepare(self):
        """
        Prepare environment
        """

        Environ.prepare(self)

        repo_path = self.getRepoPath()

        if os.path.isdir(repo_path):
            if not self.updateRepo():
                return False
        else:
            if not self.cloneRepo():
                return False

        return True

    def getBlend(self):
        """
        Get .blend fiel to start render from
        """

        repo_path = self.getRepoPath()
        fname = self.fname

        while fname.startswith('/'):
            fname = fname[1:]

        return os.path.join(repo_path, fname)
