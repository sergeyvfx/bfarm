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
# This scripts runs on the nodes inside Blender
#

import bpy
import os, shutil, stat, sys, socket

from optparse import OptionParser

def get_ip(opts):
    """
    Quite silly function to get node IP address
    """

    if opts.server_addr is not None:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        host, port = opts.server_addr.split(':')
        s.connect((host, int(port)))
        ip = s.getsockname() [0]
        s.close()
        return ip
    else:
        return [ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")] [0]

def parseOptions(argv = None):
    """
    Parse arguments passed on command line
    """

    op = OptionParser()

    # System
    op.add_option('--node-id', dest = 'node_id', default = None)
    op.add_option('--task-id', dest = 'task_id', default = None)
    op.add_option('--server-addr', dest = 'server_addr', default = None)

    # Output parameters
    op.add_option('-o', '--output-path', dest = 'output_path', default = None)
    op.add_option('-f', '--file-format', dest = 'file_format', default = 'PNG')
    op.add_option('--resolution-x', dest = 'resol_x', default = '2048')
    op.add_option('--resolution-y', dest = 'resol_y', default = '872')
    op.add_option('--percentage', dest = 'percentage', default = '100')
    op.add_option('--color-mode', dest = 'color_mode', default = 'RGB')

    # Performance
    op.add_option('--render-frame', dest = 'render_frame', default = '1')
    op.add_option('--render-threads', dest = 'render_threads', default = None)
    op.add_option('--tiles-x', dest = 'tiles_x', default = 32)
    op.add_option('--tiles-y', dest = 'tiles_y', default = 16)

    # Misc
    op.add_option('--use-stamp', dest = 'use_stamp', action = 'store_true', default = False)

    return op.parse_args(argv)

def mk_tmp_dir(tmp_dir):
    """
    Create valid temporary directory
    """

    try:
        st = os.stat(tmp_dir)
    except OSError:
        # Directory not exists
        try:
            os.mkdir(tmp_dir)
            return
        except:
            raise Exception('Unable to set up temporary directory: unable to create temporary directory')

    mode = st[stat.ST_MODE]
    if stat.S_ISDIR(mode):
        try:
            # Remove directory content
            for root, dirs, files in os.walk(tmp_dir):
                for f in files:
                    os.unlink(os.path.join(root, f))
                for d in dirs:
                    shutil.rmtree(os.path.join(root, d))
        except:
            raise Exception('Unable to set up temporary directory: unable to clean existing temporary directory')
    elif stat.S_ISREG(mode):
        try:
            os.unlink(tmp_dir)
            os.mkdir(tmp_dir)
        except:
            raise Exception('Unable to set up temporary directory: unable to create temporary directory')
    else:
        raise Exception('Unable to set up temporary directory: {0} is neither directory nor regular file' . format(tmp_dir))

def setupTmp(opts):
    """
    Setup temporary directories
    """

    tmp_dir = '/tmp/node-{0}' . format(opts.node_id)

    # Ensure temporary directory exists
    mk_tmp_dir(tmp_dir)

    # Set temporary path
    bpy.context.user_preferences.filepaths.temporary_directory = tmp_dir

def setupScenes(opts):
    """
    Customize scenes' settings
    """

    fpath = bpy.data.filepath
    fname = os.path.splitext(os.path.basename(fpath))[0]

    for scene in bpy.data.scenes:
        rd = scene.render

        # File output
        rd.file_format = opts.file_format
        rd.filepath    = ('{0}' + os.path.sep + '{1}_######') . format(opts.output_path, fname)
        rd.use_file_extension = True
        rd.use_placeholder    = False
        rd.use_overwrite      = False

        # stamp
        rd.use_stamp             = opts.use_stamp
        rd.use_stamp_note        = True
        rd.use_stamp_render_time = True

        #rd.stamp_note_text  = "rev:%s, art_rev:%s, %s" % (bpy.app.build_revision, str(get_revision()), ip)
        rd.stamp_note_text  = 'rev:{0}, node:{1}, ip:{2}, task:{3}' . format(bpy.app.build_revision, opts.node_id, get_ip(opts), opts.task_id)
        rd.stamp_font_size  = 18
        rd.stamp_foreground = 1.0, 1.0, 1.0, 1.0
        rd.stamp_background = 0.0, 0.0, 0.0, 0.75

        # Performance/memory
        rd.use_free_image_textures = True
        rd.use_save_buffers        = True
        rd.use_full_sample         = True

        if opts.render_threads is None:
            rd.threads_mode = 'AUTO'
        else:
            rd.threads_mode = 'FIXED'
            rd.threads = int(opts.render_threads)

        rd.use_local_coords = False
        if rd.parts_x < int(opts.tiles_x): rd.parts_x = int(opts.tiles_x)
        if rd.parts_y < int(opts.tiles_y): rd.parts_y = int(opts.tiles_y)

        # Resolution
        rd.resolution_percentage = int(opts.percentage)
        rd.resolution_x = int(opts.resol_x)
        rd.resolution_y = int(opts.resol_y)
        rd.use_border   = False
        rd.color_mode   = opts.color_mode

        # Set render frame
        render_frame = int(opts.render_frame)
        if render_frame > scene.frame_end:
          scene.frame_end = render_frame
          scene.frame_set(render_frame)
          scene.frame_start = render_frame
        else:
          scene.frame_set(render_frame)
          scene.frame_start = render_frame
          scene.frame_end = render_frame

def main():
    """
    All initialization stuff here
    """

    i  = sys.argv.index('--')
    argv = sys.argv[i + 1:]

    ## XXX: debug only
    #argv = ['--render-frame', '20', '--node-id', '0', '--task-id', '2', '--percentage', '80', '--output-path', '/home/nazgul/tmp', '--file-format', 'PNG', '--resolution-x', '800', '--resolution-y', '600']

    (opts, args) = parseOptions(argv)

    if opts.node_id is None or opts.output_path is None:
        raise Exception('Missed at least one of mandatory arguments: --node-id or --output-path')

    # Setup temporary directories
    setupTmp(opts)

    # Setup all scenes
    setupScenes(opts)

    # Start render
    bpy.ops.render.render(animation = True)

if __name__ == '__main__':
    main()
