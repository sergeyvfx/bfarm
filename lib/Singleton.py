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

import threading


class Singleton(object):
    """
    Implementation of singleton
    """

    _lock = threading.Lock()
    _instance = None

    def __new__(cls, *args, **kargs):
        """
        Override creating new instance
        """

        return cls.getInstance(cls, *args, **kargs)

    def __init__(self, *args):
        """
        Object initialization
        """

        # Nothig to here, make instance initialization in initINstance

    def getInstance(cls, *args, **kargs):
        """
        Static method to get object instance
        """

        with cls._lock:
            if cls._instance is None:
                cls._instance = object.__new__(cls)
                cls._instance.initInstance(*args[1:])

        return cls._instance

    def initInstance(instance):
        """
        Initialize instance
        """

        pass

    getInstance = classmethod(getInstance)
