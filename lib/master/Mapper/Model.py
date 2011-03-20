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

from sqlalchemy import MetaData, Table, Column
from sqlalchemy import Integer, Float, String, Boolean, ForeignKey, PickleType


meta = MetaData()

# System table for automated updating of database structure
versionTable = Table('version', meta,
    Column('id', Integer, primary_key=True),
    Column('version',  Float))

# Table to store registered jobs
renderJobTable = Table('jobs', meta,
    Column('id', Integer, primary_key=True),
    Column('uuid',  String),
    Column('start_time',  Float),
    Column('storage_fpath',  String),
    Column('blend_required',  Boolean),
    Column('blend_received',  Boolean),
    Column('job_type',  String),
    Column('start_frame',  Integer),
    Column('end_frame',  Integer),
    Column('fname',  String),
    Column('fname_path',  String),
    Column('blend_name',  String),
    Column('blend_path',  String),
    Column('ntasks',  Integer),
    Column('tasks_remain',  Integer),
    Column('title',  String),
    Column('file_format',  String),
    Column('resol_x',  Integer),
    Column('resol_y',  Integer),
    Column('percentage',  Integer),
    Column('color_mode',  String),
    Column('use_stamp',  Boolean),
    Column('finish_time',  Float),
    Column('priotiry',  Integer),
    Column('task_time_max',  Float),
    Column('task_time_avg',  Float),
    Column('tasks_remain',  Integer),
    Column('priority',  Integer),
    Column('render_files',  PickleType))

# Table to store registered jobs
renderTaskTable = Table('job_tasks', meta,
    Column('id', Integer, primary_key=True),
    Column('nr',  Integer),
    Column('status',  Integer),
    Column('start_time',  Float),
    Column('finish_time',  Float),
    Column('job_id', Integer, ForeignKey('jobs.id')))
