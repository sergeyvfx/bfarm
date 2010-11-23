#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# This module is based on functions from cgi and http.client modules of
# Python 3.1.2 distribution. They are adopted for the bfarm project and
# made workable with Python 2.6
#
# ***** BEGIN PFSL LICENSE BLOCK *****
#
# 1. This LICENSE AGREEMENT is between the Python Software Foundation ("PSF"),
#    and the Individual or Organization ("Licensee") accessing and otherwise
#    using Python 3.1.2 software in source or binary form and its associated
#    documentation.
# 2. Subject to the terms and conditions of this License Agreement, PSF hereby
#    grants Licensee a nonexclusive, royalty-free, world-wide license to
#    reproduce, analyze, test, perform and/or display publicly, prepare
#    derivative works, distribute, and otherwise use Python 3.1.2 alone or in
#    any derivative version, provided, however, that PSF’s License Agreement
#    and PSF’s notice of copyright, i.e.,
#    "Copyright (C) 2001-2010 Python Software Foundation; All Rights Reserved"
#    are retained in Python 3.1.2 alone or in any derivative version
#    prepared by Licensee.
# 3. In the event Licensee prepares a derivative work that is based on or
#    incorporates Python 3.1.2 or any part thereof, and wants to make the
#    derivative work available to others as provided herein, then Licensee
#    hereby agrees to include in any such work a brief summary of the changes
#    made to Python 3.1.2.
# 4. PSF is making Python 3.1.2 available to Licensee on an “AS IS” basis.
#    PSF MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF
#    EXAMPLE, BUT NOT LIMITATION, PSF MAKES NO AND DISCLAIMS ANY REPRESENTATION
#    OR WARRANTY OF MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR
#    THAT THE USE OF PYTHON 3.1.2 WILL NOT INFRINGE ANY THIRD PARTY RIGHTS.
# 5. PSF SHALL NOT BE LIABLE TO LICENSEE OR ANY OTHER USERS OF PYTHON 3.1.2
#    FOR ANY INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES OR LOSS AS A RESULT
#    OF MODIFYING, DISTRIBUTING, OR OTHERWISE USING PYTHON 3.1.2, OR ANY
#    DERIVATIVE THEREOF, EVEN IF ADVISED OF THE POSSIBILITY THEREOF.
# 6. This License Agreement will automatically terminate upon a material breach
#    of its terms and conditions.
# 7. Nothing in this License Agreement shall be deemed to create any
#    relationship of agency, partnership, or joint venture between PSF and
#    Licensee. This License Agreement does not grant permission to use PSF
#    trademarks or trade name in a trademark sense to endorse or promote
#    products or services of Licensee, or any third party.
# 8. By copying, installing or otherwise using Python 3.1.2, Licensee agrees to
#    be bound by the terms and conditions of this License Agreement.
#
# The Original Code is Copyright (C) 2001-2010 Python Software Foundation
#
# All rights reserved.
#
# ***** END PFSL LICENSE BLOCK *****
#

import re
import email.parser


def isBoundaryValid(s, _vb_pattern="^[ -~]{0,200}[!-~]$"):
    """
    Check if boundary valid
    """

    return re.match(_vb_pattern, s)


def _parseparam(s):
    while s[:1] == ';':
        s = s[1:]
        end = s.find(';')
        while end > 0 and s.count('"', 0, end) % 2:
            end = s.find(';', end + 1)
        if end < 0:
            end = len(s)
        f = s[:end]
        yield f.strip()
        s = s[end:]


def parse_header(line):
    """
    Parse a Content-type like header.
    Return the main content-type and a dictionary of options.
    """

    parts = _parseparam(';' + line)

    try:
        key = parts.__next__()
    except AttributeError:
        # Py2.6
        key = parts.next()
    except:
        raise Exception('Unable to get get part\'s key')

    pdict = {}

    for p in parts:
        i = p.find('=')
        if i >= 0:
            name = p[:i].strip().lower()
            value = p[i + 1:].strip()
            if len(value) >= 2 and value[0] == value[-1] == '"':
                value = value[1:-1]
                value = value.replace('\\\\', '\\').replace('\\"', '"')
            pdict[name] = value

    return key, pdict


def parse_headers(fp):
    """
    Parses only RFC2822 headers from a file pointer.
    """

    headers = []
    while True:
        line = fp.readline()

        if type(line) is str:
            line = bytes(line)

        headers.append(line)

        if line in (b'\r\n', b'\n', b''):
            break

    hstring = b''.join(headers).decode('iso-8859-1')

    return email.parser.Parser().parsestr(str(hstring))


def parseMultipart(fp, pdict):
    """
    Parse multipart content
    """

    # TODO: Do not store whole parts contents in the memoty

    boundary = ''
    if 'boundary' in pdict:
        boundary = pdict['boundary']
    if not isBoundaryValid(boundary):
        raise ValueError('Invalid boundary in multipart form: {0}' .
            format(boundary))

    maxlen = 0

    nextpart = b'--' + boundary.encode()
    lastpart = b'--' + boundary.encode() + b'--'
    partdict = {}
    terminator = b''

    while terminator != lastpart:
        nbytes = -1
        data = None
        if terminator:
            # At start of next part.  Read headers first.
            headers = parse_headers(fp)
            clength = headers.get('content-length')
            if clength:
                try:
                    nbytes = int(clength)
                except ValueError:
                    pass
            if nbytes > 0:
                if maxlen and nbytes > maxlen:
                    raise ValueError('Maximum content length exceeded')
                data = fp.read(nbytes)
            else:
                data = b''
        # Read lines until end of part.
        lines = []
        while 1:
            line = fp.readline()

            if type(line) is str:
                line = bytes(line)

            if not line:
                terminator = lastpart  # End outer loop
                break
            if line[:2] == b'--':
                terminator = line.strip()
                if terminator in (nextpart, lastpart):
                    break
            lines.append(line)
        # Done with part.
        if data is None:
            continue
        if nbytes < 0:
            if lines:
                # Strip final line terminator
                line = lines[-1]
                if line[-2:] == b"\r\n":
                    line = line[:-2]
                elif line[-1:] == b"\n":
                    line = line[:-1]
                lines[-1] = line
                data = b''.join(lines)
        line = headers['content-disposition']
        if not line:
            continue
        key, params = parse_header(line)
        if key != 'form-data':
            continue
        if 'name' in params:
            name = params['name']
        else:
            continue
        if name in partdict:
            partdict[name].append(data)
        else:
            partdict[name] = [data]

    return partdict
