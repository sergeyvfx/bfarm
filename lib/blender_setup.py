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

node_id        =  None
task_id        =  None
file_format    = 'PNG'
output_fpath   = None
resol_x        = 2048
resol_y        = 872
percentage     = 100
color_mode     = 'RGB'
render_frame   = 1
render_threads = None
tiles_x        = 32
tiles_y        = 16
use_stamp      = False
server_addr    = None

def get_ip():
    """
    Quite silly function to get node IP address
    """

    global server_addr

    if server_addr is not None:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        host, port = server_addr.split(':')
        s.connect((host, int(port)))
        ip = s.getsockname() [0]
        s.close()
        return ip
    else:
        return [ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")] [0]

def next_arg(argv, i):
    """
    get next argument from command line if any or raise otherwise
    """

    if i >= len(argv) - 1:
        raise Exception('Unable to parse arguments: missed value for argument {0}'.format(argv[i]))

    return argv[i + 1]

def parse_args(argv):
    """
    Parse arguments passed on command line
    """

    global node_id, task_id, output_fpath, file_format, resol_x, resol_y, percentage, color_mode, render_frame
    global render_threads, tiles_x, tiles_y, use_stamp, server_addr

    i = 0
    n = len(argv)
    while i < n:
        if argv[i] == '--node-id':
            node_id = next_arg(argv, i)
            i += 1

        if argv[i] == '--task-id':
            task_id = next_arg(argv, i)
            i += 1

        if argv[i] == '--output-path' or argv[i] == '-o':
            output_fpath = next_arg(argv, i)
            i += 1

        if argv[i] == '--file-format' or argv[i] == '-f':
            file_format = next_arg(argv, i)
            i += 1

        if argv[i] == '--resolution-x':
            resol_x = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--resolution-y':
            resol_y = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--percentage':
            percentage = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--render-frame':
            render_frame = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--render-threads':
            render_threads = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--tiles-x':
            tiles_x = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--tiles-y':
            tiles_y = int(next_arg(argv, i))
            i += 1

        if argv[i] == '--use-stamp':
            use_stamp = True

        # needed for correct IP detection
        if argv[i] == '--server-addr':
            server_addr = next_arg(argv, i)
            i += 1

        i += 1

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

def setupTmp():
    """
    Setup temporary directories
    """

    global node_id

    tmp_dir = '/tmp/node-{0}' . format(node_id)

    # Ensure temporary directory exists
    mk_tmp_dir(tmp_dir)

    # Set temporary path
    bpy.context.user_preferences.filepaths.temporary_directory = tmp_dir

def setupScenes():
    """
    Customize scenes' settings
    """

    global node_id, task_id, output_fpath, file_format, resol_x, resol_y, percentage, color_mode, render_frame
    global render_threads, tiles_x, tiles_y, use_stamp

    fpath = bpy.data.filepath
    fname = os.path.splitext(os.path.basename(fpath))[0]

    for scene in bpy.data.scenes:
        rd = scene.render

        # File output
        rd.file_format = file_format
        rd.filepath = ('{0}' + os.path.sep + '{1}_######') . format(output_fpath, fname)
        rd.use_file_extension = True
        rd.use_placeholder = False
        rd.use_overwrite = False

        # stamp
        rd.use_stamp = use_stamp
        rd.use_stamp_note = True
        rd.use_stamp_render_time = True

        #rd.stamp_note_text = "rev:%s, art_rev:%s, %s" % (bpy.app.build_revision, str(get_revision()), ip)
        rd.stamp_note_text = 'rev:{0}, node:{1}, ip:{2}, task:{3}' . format(bpy.app.build_revision, node_id, get_ip(), task_id)
        rd.stamp_font_size = 18
        rd.stamp_foreground = 1.0, 1.0, 1.0, 1.0
        rd.stamp_background = 0.0, 0.0, 0.0, 0.75

        # Performance/memory
        rd.use_free_image_textures = True
        rd.use_save_buffers = True
        rd.use_full_sample = True

        if render_threads is None:
            rd.threads_mode = 'AUTO'
        else:
            rd.threads_mode = 'FIXED'
            rd.threads = render_threads

        rd.use_local_coords = False
        if rd.parts_x < tiles_x: rd.parts_x = tiles_x
        if rd.parts_y < tiles_y: rd.parts_y = tiles_y

        # Resolution
        rd.resolution_percentage = percentage
        rd.resolution_x = resol_x
        rd.resolution_y = resol_y
        rd.use_border   = False
        rd.color_mode   = color_mode

        # Set render frame
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

    global node_id, output_fpath

    ## XXX: debug only
    #parse_args(['--render-frame', '20', '--node-id', '0', '--percentage', '80', '--output-path', '/home/nazgul/tmp', '--file-format', 'PNG', '--resolution-x', '800', '--resolution-y', '600'])
    parse_args(sys.argv)

    if node_id is None or output_fpath is None:
        raise Exception('Missed at least one of mandatory arguments: --node-id or --output-path')

    # Setup temporary directories
    setupTmp()

    # Setup all scenes
    setupScenes()

    # Start render
    bpy.ops.render.render(animation = True)

if __name__ == '__main__':
    main()
