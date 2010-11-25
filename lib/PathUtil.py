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


def isPathInside(path, parent):
    """
    Check if path inside given parent
    """

    if not path.startswith(parent):
        return False

    if len(path) == len(parent):
        return True

    if path[len(parent)] != os.path.sep:
        return  False

    return True


def getObjectPath(obj, path):
    """
    Translate path and return attr
    """

    if len(path) == 0:
        return obj

    i = path.find('/')
    rest = ''
    if i >= 0:
        field = path[:i]
        rest = path[i + 1:]
    else:
        field = path

    if field.startswith('_'):
        return None

    try:
        nobj = getattr(obj, field)
    except AttributeError:
        return None

    if nobj is not None:
        return getObjectPath(nobj, rest)

    return None
