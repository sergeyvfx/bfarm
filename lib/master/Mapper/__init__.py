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


from sqlalchemy import create_engine
from sqlalchemy.orm import create_session, mapper, relation

from Singleton import Singleton
from master.Mapper import Model
from master.RenderJob import RenderJob, RenderTask

mapperVersion = 0.1


class MapperVersion(object):
    """
    Mapper version class.

    Used for updating database structure in case of changes
    int mapped objects
    """

    def __init__(self):
        """
        Initialize version object
        """

        self.version = mapperVersion


class Mapper:
    """
    Mapper to database
    """

    def __init__(self, database_path):
        """
        Initialize new mapper
        """

        self.version = None

        self.engine = create_engine(database_path)
        self.session = create_session()
        Model.meta.bind = self.engine

        self.setMapping()
        self.deploy()

    def setMapping(self):
        """
        Set mapping class-table data
        """

        mapper(MapperVersion, Model.versionTable)
        mapper(RenderTask, Model.renderTaskTable)

        mapper(RenderJob, Model.renderJobTable, properties={
                'tasks': relation(RenderTask),
            })

    def deploy(self):
        """
        Deploy structure to database
        """

        Model.meta.create_all()  # Create structure from scratch

        versions = self.session.query(MapperVersion).all()
        if len(versions):
            self.version = versions[-1]

        if self.version is None:
            # Fully new database, just fill with system info

            self.version = MapperVersion()
            self.session.add(self.version)
            self.session.flush()
        elif self.version.version != mapperVersion:
            # TODO: database update scriots could be necessery

            self.version.version = mapperVersion
            self.session.flush()

    def addObject(self, obj):
        """
        Add object to mapped table
        """

        self.session.add(obj)
        self.session.flush()

    def getAllObjects(self, cls):
        """
        Get all objects from database
        """

        return self.session.query(cls).all()

    def updateObject(self, obj):
        """
        Update object in mapped table
        """

        self.session.flush()

    def flush(self):
        """
        Flush all changes to database
        """

        self.session.flush()
