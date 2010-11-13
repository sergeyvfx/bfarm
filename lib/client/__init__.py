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

import signal
import Logger

from client.RenderNode import RenderNode

class Client:
    """
    Render farm node client
    """

    def __init__(self):
        """
        Initialize client
        """

        self.render_node = RenderNode()

        # Set signal handlers
        self.setSignals()

    def sigint_handler(self, sig, frame):
        """
        Handler of SIGINT signal
        """

        Logger.log('Caught SIGINT signal, terminating...')
        self.render_node.requestStop()

    def setSignals(self):
        """
        Set signals handlers
        """

        signal.signal(signal.SIGINT, lambda sig, frame: self.sigint_handler(sig, frame))

    def run(self):
        """
        Run server logic
        """

        self.render_node.start()
        self.render_node.join()
