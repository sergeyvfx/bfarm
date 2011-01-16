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

import slave
from config import Config


class Environ:
    """
    Blend source environment
    """

    def __init__(self, options):
        """
        Initialize environment
        """

        node = slave.Slave().getRenderNode()

        self.jobUUID = options['jobUUID']
        self.task_nr = options['task']
        self.storage = os.path.join(Config.slave['storage_path'],
            'node-' + node.uuid, 'job-' + options['jobUUID'])

    def prepare(self):
        """
        Prepare environment
        """

        # Create directory for node data storage
        try:
            os.makedirs(self.storage)
        except OSError:
            # Direcotyr exists?
            # XXX: need better checking
            pass
        except Exception as strerror:
            raise Exception('Unable to set up environment: {0}' .
                format(strerror))

    def getOutput(self):
        """
        Get output directory
        """

        output = os.path.join(self.storage, 'task-{0}-out' .
            format(self.task_nr))

        try:
            os.makedirs(output)
        except OSError:
            # Direcotyr exists?
            # XXX: need better checking
            pass
        except Exception as strerror:
            raise Exception('Unable to create outout directory: {0}' .
                format(strerror))

        return output

    def getBlend(self):
        """
        Get .blend fiel to start render from
        """

        raise Exception('Shoukd be overwritten')
