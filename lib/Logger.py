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
from datetime import datetime

logger_buffer = ''
logger_lock = threading.Lock()
logger_handlers = []


def addLoggerHandler(handler):
    """
    Add new logging handler
    """

    global logger_handlers

    logger_handlers.append(handler)


def runLoggerHandlers():
    """
    Run all logging handlers
    """

    global logger_handlers
    global logger_buffer

    ok = False

    for handler in logger_handlers:
        ok = True
        handler(logger_buffer)

    if ok:
        logger_buffer = ''


def log(text, time_stamp=True):
    """
    Log text
    """

    global logger_lock
    global logger_buffer

    message = ''
    if time_stamp:
        d = datetime.now()
        strd = d.strftime('%Y-%m-%d %H:%M:%S')
        message = '[{0}] {1}' . format(strd, text)
    else:
        message = text

    with logger_lock:
        logger_buffer += message + '\n'
        runLoggerHandlers()
        print(message)


def getBuffer():
    """
    Get logger buffer
    """

    return logger_buffer
