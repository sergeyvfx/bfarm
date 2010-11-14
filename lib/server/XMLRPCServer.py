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

import os, socket

try:
    # python 3.0 and newer
    import xmlrpc.client
    import xmlrpc.server

except ImportError:
    import xmlrpclib
    import SimpleXMLRPCServer

    # small hack to make API py3-compatible
    class xmlrpc:
        client = xmlrpclib
        server = SimpleXMLRPCServer

    setattr(xmlrpc.client, 'Binary', xmlrpclib.Binary)

import Logger

from SignalThread import SignalThread

class XMLRPCHandlers:
    """
    Set of XML-RPC handlers
    """

    class XMLRPCNode:
        def __init__(self, render_server):
            """
            Initialize XML-RPC node handlers
            """

            self.render_server = render_server

        def register(self, client_info):
            """
            Register rendering node
            """

            return self.render_server.registerNode(client_info)

        def unregister(self, nodeUUID, client_info):
            """
            Register rendering node
            """

            node = self.render_server.getNode(nodeUUID)

            if node is None:
                return False

            return self.render_server.unregisterNode(node)

        def touch(self, nodeUUID, client_info):
            """
            Register rendering node
            """

            node = self.render_server.getNode(nodeUUID)

            if node is None:
                return False

            return self.render_server.touchNode(node)

    class XMLRPCJob:
        def __init__(self, render_server):
            """
            Initialize XML-RPC job handlers
            """

            self.render_server = render_server

        def register(self, options, client_info):
            """
            Register new job
            """

            return self.render_server.registerJob(options)

        def unregister(self, jobUUID, client_info):
            """
            Unregister job
            """

            job = self.render_server.getJob(jobUUID)
            if job is None:
                return job

            return self.render_server.unregisterJob(job)

        def requestTask(self, nodeUUID, client_info):
            """
            Request task for rendering node
            """

            node = self.render_server.getNode(nodeUUID)

            return self.render_server.requestTask(node)

        def getBlendChunk(self, jobUUID, chunk_nr, client_info):
            """
            Get chunk of .blend file
            """

            job = self.render_server.getJob(jobUUID)
            if job is None:
                return False

            chunk = job.getBlendChunk(chunk_nr)
            if chunk is None:
                return False

            return xmlrpc.client.Binary(chunk)

        def getBlendChecksum(self, jobUUID, client_info):
            """
            Get checksum of .blend file
            """

            job = self.render_server.getJob(jobUUID)

            if job is None:
                return ''

            return job.getBlendChecksum()

        def putRenderChunk(self, jobUUID, fname, chunk, chunk_nr, client_info):
            """
            Put chunk of rendered file
            """

            # XXX: should it be something else?
            if fname.find(os.path.sep) >= 0:
                Logger.log('Attempt to write to invalid file {0}, ip {2}' . format(fname, client_info['address'][0]))
                return False

            job = self.render_server.getJob(jobUUID)
            if job is None:
                return False

            if chunk != False:
                chunk = chunk.data

            return job.putRenderChunk(fname, chunk, chunk_nr)

        def putBlendChunk(self, jobUUID, chunk, chunk_nr, client_info):
            """
            Get chunk of .blend file
            """

            job = self.render_server.getJob(jobUUID)
            if job is None:
                return False

            if chunk != False:
                chunk = chunk.data

            return job.putBlendChunk(chunk, chunk_nr)

        def taskComplete(self, jobUUID, task_nr, client_info):
            """
            Mark task as DONE
            """

            job = self.render_server.getJob(jobUUID)
            if job is None:
                return False

            return self.render_server.taskComplete(job, task_nr)

    def __init__(self, render_server):
        """
        Initialize XML-RPC handlers
        """

        self.job  = XMLRPCHandlers.XMLRPCJob(render_server)
        self.node = XMLRPCHandlers.XMLRPCNode(render_server)
        self.render_server = render_server

    def requestStop(self, clientInfo):
        """
        Stop serve
        """

        self.render_server.requestStop()

        return True

class XMLRPCRequestHandler(xmlrpc.server.SimpleXMLRPCRequestHandler):
    """
    Request handler class
    """

    def __init__(self, request, client_address, server):
        """
        Initialize request handler
        """

        self.client_address = client_address;
        self.server = server

        xmlrpc.server.SimpleXMLRPCRequestHandler.__init__(self, request, client_address, server)

    def log_request(self,  code='-', size='-'):
        """
        Request printer
        """

        pass

    def _dispatch(self, method, params):
        """
        Dispatches the XML-RPC method
        """

        # Append client info
        params += ({'address': self.client_address},)

        func = None
        try:
            # check to see if a matching function has been registered
            func = self.server.funcs[method]
        except KeyError:
            if self.server.instance is not None:
                # check for a _dispatch method
                if hasattr(self.server.instance, '_dispatch'):
                    return self.server.instance._dispatch(method, params)
                else:
                    # call instance method directly
                    try:
                        func = xmlrpc.server.resolve_dotted_attribute(
                                self.server.instance,
                                method,
                                self.server.allow_dotted_names
                                )
                    except AttributeError:
                        pass


        if func is not None:
            return func(*params)
        else:
            raise Exception('method "%s" is not supported' % method)

class XMLRPCServer(xmlrpc.server.SimpleXMLRPCServer, SignalThread):
    """
    XML-RPC access for render frame server
    """

    def __init__(self, address, render_server):
        """
        Initialize XML-RPC server
        """

        SignalThread.__init__(self, name = 'XMLRPCServerThread')
        xmlrpc.server.SimpleXMLRPCServer.__init__(self, address, XMLRPCRequestHandler)

        self.render_server = render_server
        self.handlers      = XMLRPCHandlers(render_server)
        self.register_instance(self.handlers)
        self.daemon        = True
        self.address       = address
        self.allow_dotted_names = True

    def server_bind(self):
        """
        Bind server to socket
        """

        # reuse address for fast restart after crash
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        xmlrpc.server.SimpleXMLRPCServer.server_bind(self)

    def verify_request(self, request, client_address):
        """
        Chack if RPC is avaliable for client
        """

        #
        # TODO: implement this
        #

        return True


    def run(self):
        """
        Serve requests till server stop
        """

        Logger.log('XML-RPC started at {0}:{1}'.format(self.address[0], self.address[1]))

        while not self.render_server.isStopped():
            self.handle_request()
