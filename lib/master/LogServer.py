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


class LogServer:
    """
    BFarm logging server
    """

    def __init__(self):
        """
        Initialzie new logging server
        """

        self.sources = {}

    def addSource(self, source):
        """
        Add new logging source
        """

        self.sources[source] = {'name': source,
                                'time': time.time(),
                                'size': 0,
                                'buffer': ''}

    def getSource(self, source):
        """
        Get specified source
        """

        return self.sources.get(source)

    def removeSource(self, source):
        """
        Remove source
        """

        del self.sources[source]

    def getSources(self):
        """
        Get list of all sources
        """

        return [self.sources[x] for x in self.sources]

    def logMessage(self, source, message):
        """
        Add new log message from source
        """

        src = self.sources[source]

        src['time'] = time.time()
        src['size'] += len(message)
        src['buffer'] += message

    def getBuffer(self, source):
        """
        Get all messages reported by source
        """

        return self.sources[source]['buffer']

    def hasSource(self, source):
        """
        Check if source registered
        """

        return source in self.sources
