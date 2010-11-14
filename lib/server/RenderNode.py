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

import time
from config import Config

class RenderNode:
    """
    Renderfarm node descriptor
    """

    total_nodes = 0

    def __init__(self, client_info):
        """
        Initialize node descriptor
        """

        self.uuid        = str(RenderNode.total_nodes)
        self.ip          = client_info['address'][0]
        self.access_time = time.time()
        self.enabled     = True

        RenderNode.total_nodes += 1

    def getUUID(self):
        """
        Get UUID of node
        """

        return self.uuid

    def isAlive(self):
        """
        Check is node still alive or could be dropped
        """

        return time.time() - self.access_time <= Config.server['client_max_age']

    def touch(self):
        """
        Touch node to update last access time
        """

        self.access_time = time.time()

    def isEnabled(self):
        """
        Check if node enabled
        """

        return self.enabled

    def setEnabled(self, enabled):
         """
         Set enabled flag
         """

         self.enabled = enabled
