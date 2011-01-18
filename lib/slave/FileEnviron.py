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
import time
import sys

import Logger

import slave

from Hash import md5_for_file
from slave.Environ import Environ


class FileEnviron(Environ):
    """
    Environment for single file rendering
    """

    def __init__(self, options):
        """
        Initialize environment
        """

        Environ.__init__(self, options)

        self.fname = options['fname']
        if self.fname.startswith('file://'):
            self.fname = self.fname[7:]

    def isChecksumOk(self):
        """
        Compare MD5 checksum of received file and file at serevr
        """

        proxy = slave.Slave().getProxy()

        self_checksum = md5_for_file(self.getBlend())
        master_checksum = proxy.job.getBlendChecksum(self.jobUUID)

        return self_checksum == master_checksum

    def receiveFile(self):
        """
        Receive .blend file from master
        """

        fname = self.getBlend()
        proxy = slave.Slave().getProxy()
        node = slave.Slave().getRenderNode()

        nodeUUID = node.getUUID()

        if os.path.isfile(fname):
            if self.isChecksumOk():
                # checksum matched -- nothing to do here
                return True
            else:
                Logger.log('Checksum mistmatch, ' +
                    're-receiving file {0} from master' . format(self.fname))
        else:
            # XXX: need better handling
            Logger.log('Receiving file {0} from master' . format(self.fname))

        with open(fname, 'wb') as handle:
            chunk_nr = 0
            while True:
                try:
                    chunk = proxy.job.getBlendChunk(nodeUUID, self.jobUUID,
                                                    self.task_nr, chunk_nr)
                    ok = True
                except socket.error as strerror:
                    Logger.log('Error receiving .blend file from master: {0}' .
                        format(strerror))

                    time.sleep(0.2)
                except:
                    err = sys.exc_info() [0]
                    Logger.log('Unexpected error: {0}' . format(err))
                    raise

                if ok:
                    if type(chunk) is dict:
                        if 'FINISHED' in chunk:
                            return True
                        elif 'CANCELLED' in chunk:
                            # Transmission was cancelled by master
                            # Happens after job reassigning, cancelling
                            # jobs and so on
                            Logger.log('File transmission was cancelled ' +
                                       'by master')

                            return False
                        else:
                            return False

                    handle.write(chunk.data)

                    chunk_nr += 1

        return False

    def prepare(self):
        """
        Prepare environment
        """

        Environ.prepare(self)

        # Receive file from master
        return self.receiveFile()

    def getBlend(self):
        """
        Get .blend fiel to start render from
        """

        return os.path.join(self.storage, self.fname)
