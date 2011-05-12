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

import slave

from slave.VCSEnviron import VCSEnviron


class SVNEnviron(VCSEnviron):
    """
    Environment for SVN-based source rendering
    """

    vcs_id = 'svn'  # Identifier of VCS in URL
    fname_sep = ':'  # Separator of repo name/file name
    commit_sep = '@'  # Separator of file name/commit id (revision)

    def trimRepo(self, repo):
        """
        Trim unaffected prefix/suffix from repo name
        """

        repo = VCSEnviron.trimRepo(self, repo)

        prefixes = ['http://', 'https://', 'svn://']

        for x in prefixes:
            if repo.startswith(x):
                return repo

        return 'svn://' + repo

    def getCloneCmd(self):
        """
        Get command to clone repo
        """

        repo_path = self.getRepoPath()

        return  ['svn', 'co', self.repo, repo_path]

    def getUpdateCmd(self):
        """
        Get command to update repo
        """

        repo_path = self.getRepoPath()

        command = ['svn', 'up']

        if self.commit != 0:
            command += ['-r', self.commit]

        command += [repo_path]

        return command
