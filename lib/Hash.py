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

import hashlib


def md5_for_file(filename, block_size=2 ** 20):
    """
    Get MD5 checksub of file
    """

    f = open(filename, 'rb')

    md5 = hashlib.md5()
    while True:
        data = f.read(block_size)

        if not data:
            break

        md5.update(data)

    f.close()

    bytes = md5.digest()

    byteStr = ''
    for x in bytes:
        if type(x) == int:
            b = x
        else:
            b = ord(x)

        byteStr += '%x%x' % (b / 16, b % 16)

    return byteStr

if __name__ == '__main__':
    print(md5_for_file('../storage/job-0/test.blend'))
